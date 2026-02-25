import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductsModule } from '../products/products.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [PrismaModule, ProductsModule],
  controllers: [AdminController],
})
export class AdminModule {}
