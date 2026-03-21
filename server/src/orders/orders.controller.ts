import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/auth/current-user.decorator';
import type { CurrentUserInfo } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { CheckoutDto } from './dto/checkout.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('my')
  getMyOrders(@CurrentUser() user: CurrentUserInfo) {
    return this.ordersService.getUserOrders(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  checkout(
    @CurrentUser() user: CurrentUserInfo,
    @Body() dto: CheckoutDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.ordersService.checkout({
      userId: user.id,
      items: dto.items,
      fullName: dto.fullName,
      phone: dto.phone,
      address: dto.address,
      paymentMethod: dto.paymentMethod,
      idempotencyKey,
    });
  }
}
