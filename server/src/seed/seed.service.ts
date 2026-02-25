import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);
  private readonly PRODUCT_IMAGE_URL =
    'https://bizweb.dktcdn.net/100/442/971/products/did-027-5-f7c2b16a-8f8e-4d4c-aeec-9d56c1a042b9.jpg?v=1759163974073';

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedUsers();

    const count = await this.prisma.product.count();
    if (count < 50) {
      this.logger.log('Seeding demo catalog...');

      const brandNames = ['Tamiya', 'Bandai', 'Kotobukiya'];
      const categoryNames = ['Gundam', 'Xe mô hình', 'Figure'];

      const brands = await Promise.all(
        brandNames.map((name) =>
          this.prisma.brand.upsert({
            where: { name },
            create: { name },
            update: {},
          }),
        ),
      );

      const categories = await Promise.all(
        categoryNames.map((name) =>
          this.prisma.category.upsert({
            where: { name },
            create: { name },
            update: {},
          }),
        ),
      );

      const byBrandId = new Map(brands.map((b) => [b.name, b.id] as const));
      const byCategoryId = new Map(categories.map((c) => [c.name, c.id] as const));

      const brandPool = [
        { name: 'Bandai', id: byBrandId.get('Bandai')! },
        { name: 'Tamiya', id: byBrandId.get('Tamiya')! },
        { name: 'Kotobukiya', id: byBrandId.get('Kotobukiya')! },
      ];
      const categoryPool = [
        { name: 'Gundam', id: byCategoryId.get('Gundam')! },
        { name: 'Xe mô hình', id: byCategoryId.get('Xe mô hình')! },
        { name: 'Figure', id: byCategoryId.get('Figure')! },
      ];

      const countNow = await this.prisma.product.count();
      const target = 50;
      const toCreate = Math.max(0, target - countNow);

      const tags = [
        'Limited',
        'New',
        'Hot',
        'Best Seller',
        'Premium',
        'Detail',
        'Easy Build',
        'Collector',
      ];

      const data = Array.from({ length: toCreate }, (_, idx) => {
        const n = countNow + idx + 1;
        const brand = brandPool[n % brandPool.length];
        const category = categoryPool[n % categoryPool.length];
        const tag = tags[n % tags.length];
        const priceBase = 150_000 + (n % 20) * 35_000;
        const price = Math.max(90_000, Math.min(2_500_000, priceBase));

        const name = `${category.name} Demo #${n} (${tag})`;
        const description = `Sản phẩm demo phục vụ đồ án. Brand: ${brand.name}. Danh mục: ${category.name}.`;

        return {
          name,
          description,
          price,
          imageUrl: this.PRODUCT_IMAGE_URL,
          brandId: brand.id,
          categoryId: category.id,
        };
      });

      if (data.length > 0) {
        await this.prisma.product.createMany({ data });
      }
    }

    await this.prisma.product.updateMany({
      where: {},
      data: { imageUrl: this.PRODUCT_IMAGE_URL },
    });

    await this.ensureProductImages();
    this.logger.log('Seed completed.');
  }

  private async seedUsers() {
    const adminEmail = 'admin@demo.local';
    const adminPassword = 'Admin@123';
    const userEmail = 'user@demo.local';
    const userPassword = 'User@123';

    const [adminPasswordHash, userPasswordHash] = await Promise.all([
      bcrypt.hash(adminPassword, 10),
      bcrypt.hash(userPassword, 10),
    ]);

    await this.prisma.user.upsert({
      where: { email: adminEmail },
      create: {
        email: adminEmail,
        passwordHash: adminPasswordHash,
        role: Role.admin,
        fullName: 'Admin',
        phone: '',
        address: '',
      },
      update: {
        passwordHash: adminPasswordHash,
        role: Role.admin,
      },
    });

    await this.prisma.user.upsert({
      where: { email: userEmail },
      create: {
        email: userEmail,
        passwordHash: userPasswordHash,
        role: Role.user,
        fullName: 'User',
        phone: '',
        address: '',
      },
      update: {
        passwordHash: userPasswordHash,
        role: Role.user,
      },
    });
  }

  private async ensureProductImages() {
    const products = await this.prisma.product.findMany({
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    });

    for (let index = 0; index < products.length; index += 1) {
      const product = products[index];
      const existingCount = await this.prisma.productImage.count({
        where: { productId: product.id },
      });

      if (existingCount >= 4) {
        await this.prisma.productImage.updateMany({
          where: { productId: product.id },
          data: { url: this.PRODUCT_IMAGE_URL },
        });
        continue;
      }

      const needed = 4 - existingCount;

      const data = Array.from({ length: needed }, (_, i) => {
        const sortOrder = existingCount + i;

        return {
          productId: product.id,
          url: this.PRODUCT_IMAGE_URL,
          sortOrder,
        };
      });

      if (data.length > 0) {
        await this.prisma.productImage.createMany({ data });
      }

      await this.prisma.productImage.updateMany({
        where: { productId: product.id },
        data: { url: this.PRODUCT_IMAGE_URL },
      });
    }
  }
}
