import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { AdminModule } from './admin/admin.module';
import { ContactModule } from './contact/contact.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    PrismaModule,
    SeedModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    ContactModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
