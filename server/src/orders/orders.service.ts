import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async checkout(input: {
    userId: string;
    items: { productId: string; quantity: number }[];
    fullName: string;
    phone: string;
    address: string;
    paymentMethod: 'COD' | 'BANK_TRANSFER';
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: input.userId },
    });
    if (!user) throw new BadRequestException('User not found');

    const productIds = input.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('Some products not found');
    }

    const productById = new Map(products.map((p) => [p.id, p] as const));

    let subtotal = 0;
    const orderItemsData = input.items.map((i) => {
      const p = productById.get(i.productId)!;
      const lineTotal = p.price * i.quantity;
      subtotal += lineTotal;
      return {
        productId: p.id,
        productName: p.name,
        unitPrice: p.price,
        quantity: i.quantity,
        lineTotal,
      };
    });

    const shippingFee = 0;
    const total = subtotal + shippingFee;

    const saved = await this.prisma.order.create({
      data: {
        userId: user.id,
        fullName: input.fullName,
        phone: input.phone,
        address: input.address,
        paymentMethod: input.paymentMethod,
        status: 'PENDING',
        subtotal,
        shippingFee,
        total,
        items: { create: orderItemsData },
      },
      include: { items: { include: { product: true } } },
    });

    return {
      id: saved.id,
      status: saved.status,
      paymentMethod: saved.paymentMethod,
      subtotal: saved.subtotal,
      shippingFee: saved.shippingFee,
      total: saved.total,
      createdAt: saved.createdAt,
      items: saved.items.map((it) => ({
        productId: it.productId,
        productName: it.productName,
        unitPrice: it.unitPrice,
        quantity: it.quantity,
        lineTotal: it.lineTotal,
      })),
    };
  }
}
