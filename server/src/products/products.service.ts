import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AdminCreateProductDto,
  AdminUpdateProductDto,
} from './dto/admin-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  listBrands() {
    return this.prisma.brand.findMany({ orderBy: { name: 'asc' } });
  }

  listCategories() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  async listProducts(query: {
    q?: string;
    brandId?: string;
    categoryId?: string;
  }) {
    return this.prisma.product.findMany({
      where: {
        ...(query.q
          ? { name: { contains: query.q, mode: 'insensitive' } }
          : {}),
        ...(query.brandId ? { brandId: query.brandId } : {}),
        ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  getProduct(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  async getRelatedProducts(id: string) {
    const product = await this.getProduct(id);
    if (!product) return [];

    return this.prisma.product.findMany({
      where: { categoryId: product.categoryId, NOT: { id } },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
      take: 6,
      orderBy: { createdAt: 'desc' },
    });
  }

  // Admin helpers
  adminListProducts() {
    return this.prisma.product.findMany({
      include: {
        brand: true,
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  adminCreateProduct(dto: AdminCreateProductDto) {
    const imageUrls = dto.imageUrls?.filter((u) => u.trim().length > 0) ?? [];
    const mainImage = imageUrls[0] ?? null;

    return this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description ?? '',
        price: dto.price,
        imageUrl: mainImage ?? undefined,
        brandId: dto.brandId,
        categoryId: dto.categoryId,
        images:
          imageUrls.length > 0
            ? {
                create: imageUrls.map((url, index) => ({
                  url,
                  sortOrder: index,
                })),
              }
            : undefined,
      },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  adminUpdateProduct(id: string, dto: AdminUpdateProductDto) {
    const imageUrls = dto.imageUrls?.filter((u) => u.trim().length > 0);

    return this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.price !== undefined ? { price: dto.price } : {}),
        ...(dto.brandId !== undefined ? { brandId: dto.brandId } : {}),
        ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
        ...(imageUrls
          ? {
              imageUrl: imageUrls[0] ?? null,
              images: {
                deleteMany: {},
                create: imageUrls.map((url, index) => ({
                  url,
                  sortOrder: index,
                })),
              },
            }
          : {}),
      },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  adminDeleteProduct(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }
}
