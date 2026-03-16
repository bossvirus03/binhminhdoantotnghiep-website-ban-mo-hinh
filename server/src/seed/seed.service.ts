import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);
  private readonly PRODUCT_IMAGE_URLS = [
    'https://bizweb.dktcdn.net/thumb/large/100/479/026/products/vn-11134207-7r98o-lqinnu7vn1h3ef-1705295504374.jpg?v=1705295512183',
    'https://www.gundambienhoa.com/storage/app/uploads/public/682/81a/f6f/68281af6f392f557753445.webp',
    'https://product.hstatic.net/200000326537/product/n2745402001001_002_83df2aa705d6472e9e4bb2ce5cb64ac6_grande.jpg',
    'https://product.hstatic.net/200000326537/product/192_5938_s_749hih2x0xmnpo1fgmdcwsmlvnnn_3d74dc92eb244bceb7b27e16c7eb4881_master.jpg',
    'https://azgundam.com/wp-content/uploads/2026/03/HG-NT-1-GUNDAM-AZGUNDAM-1.jpg',
    'https://bizweb.dktcdn.net/thumb/large/100/523/928/products/download-5-1758021655825.jpg?v=1758021659283',
    'https://bizweb.dktcdn.net/thumb/1024x1024/100/442/971/products/download-81-1720807147478.jpg?v=1720807172187',
    'https://product.hstatic.net/200000326537/product/10841845p_3556bbb20b4640d1af24c9fcc5693bc2_master.jpg',
    'https://www.gundambienhoa.com/storage/app/uploads/public/682/621/2b8/6826212b86b52084600834.jpg',
    'https://azgundam.com/wp-content/uploads/2023/08/HG-GUNDAM-CALIBARN-AZGUNDAM-2.jpg',
    'https://www.usagundamstore.com/cdn/shop/files/a459c8ea-02ed-4cec-9510-3a6b7ee53e9d.webp?v=1762288461',
    'https://preview.redd.it/new-picture-of-the-hg-red-gundam-including-its-accessories-v0-lcvltsyu18he1.jpeg?width=640&crop=smart&auto=webp&s=9aa684f77ff2457a0c8e4bd1e94fd32d4af02cb9',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyyD9KYCAWV1RnBvEMNCPLa3tc1MFsFct5DQ&s',
    'https://bizweb.dktcdn.net/thumb/1024x1024/100/387/684/products/banh691811-0-result.jpg?v=1749811383107',
    'https://m.media-amazon.com/images/S/pv-target-images/448c61bee6f0af55cd9da93af93df57d2abf67a1bb2ab1e55263ae23af522d4e.jpg',
    'https://gundamshop.vn/wp-content/uploads/2024/06/1-37e2e49f-33a4-41c9-9038-9769cbd4d532.webp',
    'https://www.sideshow.com/cdn-cgi/image/width=850,quality=90,f=auto/https://www.sideshow.com/storage/product-images/914368/tamashii-nations-mobile-suit-gundam-burning-gundam-burning-gundam-second-action-figure-gallery-67eacea0d0d6f.jpg',
    'https://store.bbcosplay.com/news/2022/12/16/gundam-la-gi-ban-biet-gi-ve-the-loai-mo-hinh-do-choi-nay4.jpg',
    'https://store.bbcosplay.com/news/2022/12/16/chung-loai-gunpla-gundam-ban-nen-biet5.jpg',
    'https://azgundam.com/wp-content/uploads/2025/04/HG-PSYCHO-GUNDAM-MK-II-AZGUNDAM-1.jpg',
    'https://nhtq.net/wp-content/uploads/2025/03/mo-hinh-nhan-vat-gundam.jpg',
  ];

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
      const byCategoryId = new Map(
        categories.map((c) => [c.name, c.id] as const),
      );

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
        const imageUrl = this.getProductImageUrl(n - 1);

        return {
          name,
          description,
          price,
          imageUrl,
          brandId: brand.id,
          categoryId: category.id,
        };
      });

      if (data.length > 0) {
        await this.prisma.product.createMany({ data });
      }
    }

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

  private getProductImageUrl(index: number): string {
    return this.PRODUCT_IMAGE_URLS[index % this.PRODUCT_IMAGE_URLS.length];
  }

  private async ensureProductImages() {
    const products = await this.prisma.product.findMany({
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    });

    for (let index = 0; index < products.length; index += 1) {
      const product = products[index];
      const url = this.getProductImageUrl(index);

      await this.prisma.product.update({
        where: { id: product.id },
        data: { imageUrl: url },
      });

      const existingCount = await this.prisma.productImage.count({
        where: { productId: product.id },
      });

      if (existingCount >= 4) {
        await this.prisma.productImage.updateMany({
          where: { productId: product.id },
          data: { url },
        });
        continue;
      }

      const needed = 4 - existingCount;

      const data = Array.from({ length: needed }, (_, i) => {
        const sortOrder = existingCount + i;

        return {
          productId: product.id,
          url,
          sortOrder,
        };
      });

      if (data.length > 0) {
        await this.prisma.productImage.createMany({ data });
      }

      await this.prisma.productImage.updateMany({
        where: { productId: product.id },
        data: { url },
      });
    }
  }
}
