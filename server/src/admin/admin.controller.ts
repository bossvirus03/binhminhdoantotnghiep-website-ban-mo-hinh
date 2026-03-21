import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Delete,
  Post,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { Roles } from '../common/auth/roles.decorator';
import { RolesGuard } from '../common/auth/roles.guard';
import { ProductsService } from '../products/products.service';
import { CurrentUser, type CurrentUserInfo } from '../common/auth/current-user.decorator';
import {
  AdminCreateProductDto,
  AdminUpdateProductDto,
} from '../products/dto/admin-product.dto';
import {
  AdminCreateBrandDto,
  AdminCreateCategoryDto,
  AdminUpdateBrandDto,
  AdminUpdateCategoryDto,
} from '../products/dto/admin-taxonomy.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly products: ProductsService,
  ) {}

  // Dashboard stats
  @Get('dashboard')
  async dashboard() {
    const [users, products, orders, revenueAgg, recentOrders, orderItems] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.product.count(),
        this.prisma.order.count(),
        this.prisma.order.aggregate({ _sum: { total: true } }),
        this.prisma.order.findMany({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            },
          },
          select: { createdAt: true, total: true },
          orderBy: { createdAt: 'asc' },
        }),
        this.prisma.orderItem.findMany({
          include: { product: { include: { category: true } } },
        }),
      ]);

    // Orders & revenue for last 7 days
    const days: {
      date: string;
      label: string;
      orders: number;
      revenue: number;
    }[] = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      const label = `${d.getDate().toString().padStart(2, '0')}/${(
        d.getMonth() + 1
      )
        .toString()
        .padStart(2, '0')}`;

      const dayOrders = recentOrders.filter(
        (o) => o.createdAt.toISOString().slice(0, 10) === dateKey,
      );

      const ordersCount = dayOrders.length;
      const dayRevenue = dayOrders.reduce((sum, o) => sum + o.total, 0);

      days.push({
        date: dateKey,
        label,
        orders: ordersCount,
        revenue: dayRevenue,
      });
    }

    // Revenue by category
    const revenueByCategoryMap = new Map<string, number>();
    for (const item of orderItems) {
      const catName = item.product.category?.name ?? 'Khác';
      const prev = revenueByCategoryMap.get(catName) ?? 0;
      revenueByCategoryMap.set(catName, prev + item.lineTotal);
    }

    const revenueByCategory = Array.from(revenueByCategoryMap.entries())
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value);

    return {
      userCount: users,
      productCount: products,
      orderCount: orders,
      revenue: revenueAgg._sum.total ?? 0,
      ordersLast7Days: days,
      revenueByCategory,
    };
  }

  // Users
  @Get('users')
  listUsers() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });
  }

  @Patch('users/:id/role')
  updateUserRole(
    @Param('id') id: string,
    @Body() body: { role: 'user' | 'admin' },
  ) {
    return this.prisma.user.update({
      where: { id },
      data: { role: body.role },
    });
  }

  @Post('users')
  async createUser(
    @Body() body: { email: string; password: string; role?: 'user' | 'admin' },
  ) {
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const role = body.role ?? 'user';

    if (!email || !password) {
      throw new BadRequestException('Email và mật khẩu là bắt buộc');
    }

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException('Email đã tồn tại');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string, @CurrentUser() current: CurrentUserInfo) {
    if (current.id === id) {
      throw new BadRequestException('Không thể tự xóa tài khoản của bạn');
    }
    return this.prisma.user.delete({ where: { id } });
  }

  // Brands
  @Get('brands')
  listBrands() {
    return this.prisma.brand.findMany({ orderBy: { name: 'asc' } });
  }

  @Post('brands')
  createBrand(@Body() dto: AdminCreateBrandDto) {
    return this.prisma.brand.create({ data: { name: dto.name.trim() } });
  }

  @Patch('brands/:id')
  updateBrand(@Param('id') id: string, @Body() dto: AdminUpdateBrandDto) {
    return this.prisma.brand.update({
      where: { id },
      data: { ...(dto.name ? { name: dto.name.trim() } : {}) },
    });
  }

  @Delete('brands/:id')
  deleteBrand(@Param('id') id: string) {
    return this.prisma.brand.delete({ where: { id } });
  }

  // Categories
  @Get('categories')
  listCategories() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  @Post('categories')
  createCategory(@Body() dto: AdminCreateCategoryDto) {
    return this.prisma.category.create({ data: { name: dto.name.trim() } });
  }

  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() dto: AdminUpdateCategoryDto) {
    return this.prisma.category.update({
      where: { id },
      data: { ...(dto.name ? { name: dto.name.trim() } : {}) },
    });
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.prisma.category.delete({ where: { id } });
  }

  // Products (list only for now, CRUD có thể bổ sung sau)
  @Get('products')
  listProducts() {
    return this.products.adminListProducts();
  }

  @Post('products')
  createProduct(@Body() dto: AdminCreateProductDto) {
    return this.products.adminCreateProduct(dto);
  }

  @Patch('products/:id')
  updateProduct(@Param('id') id: string, @Body() dto: AdminUpdateProductDto) {
    return this.products.adminUpdateProduct(id, dto);
  }

  @Delete('products/:id')
  deleteProduct(@Param('id') id: string) {
    return this.products.adminDeleteProduct(id);
  }

  // Orders
  @Get('orders')
  listOrders() {
    return this.prisma.order.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Patch('orders/:id/status')
  updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: 'PENDING' | 'PAID' | 'CANCELLED' },
  ) {
    return this.prisma.order.update({
      where: { id },
      data: { status: body.status },
    });
  }

  // Lấy chi tiết đơn hàng (bao gồm items)
  @Get('orders/:id')
  async getOrderDetail(@Param('id') id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: true,
      },
    });
    if (!order) return null;
    return order;
  }

  @Delete('orders/:id')
  async deleteOrder(@Param('id') id: string) {
    const existing = await this.prisma.order.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Order not found');

    await this.prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({ where: { orderId: id } });
      await tx.order.delete({ where: { id } });
    });

    return { ok: true };
  }
}
