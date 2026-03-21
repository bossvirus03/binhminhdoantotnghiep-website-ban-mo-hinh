import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private toCheckoutResult(order: {
    id: string;
    status: any;
    paymentMethod: any;
    subtotal: number;
    shippingFee: number;
    total: number;
    createdAt: Date;
    items: Array<{
      productId: string;
      productName: string;
      unitPrice: number;
      quantity: number;
      lineTotal: number;
    }>;
  }) {
    return {
      id: order.id,
      status: order.status,
      paymentMethod: order.paymentMethod,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      total: order.total,
      createdAt: order.createdAt,
      items: order.items.map((it) => ({
        productId: it.productId,
        productName: it.productName,
        unitPrice: it.unitPrice,
        quantity: it.quantity,
        lineTotal: it.lineTotal,
      })),
    };
  }

  async getUserOrders(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: { imageUrl: true },
            },
          },
        },
      },
    });

    return orders.map((order) => ({
      id: order.id,
      status: order.status,
      paymentMethod: order.paymentMethod,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      total: order.total,
      fullName: order.fullName,
      phone: order.phone,
      address: order.address,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        lineTotal: item.lineTotal,
        productImage: item.product?.imageUrl ?? null,
      })),
    }));
  }

  async checkout(input: {
    userId: string;
    items: { productId: string; quantity: number }[];
    fullName: string;
    phone: string;
    address: string;
    paymentMethod: 'COD' | 'BANK_TRANSFER';
    idempotencyKey?: string;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: input.userId },
    });
    if (!user) throw new BadRequestException('User not found');

    const idempotencyKey = input.idempotencyKey?.trim();
    if (idempotencyKey) {
      if (idempotencyKey.length > 128) {
        throw new BadRequestException('Idempotency-Key too long');
      }

      const existing = await this.prisma.order.findFirst({
        where: { userId: user.id, idempotencyKey },
        include: { items: true },
      });

      if (existing) return this.toCheckoutResult(existing);
    }

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

    try {
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
          idempotencyKey: idempotencyKey || null,
          items: { create: orderItemsData },
        },
        include: { items: true },
      });

      return this.toCheckoutResult(saved);
    } catch (e: unknown) {
      if (
        idempotencyKey &&
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        const existing = await this.prisma.order.findFirst({
          where: { userId: user.id, idempotencyKey },
          include: { items: true },
        });
        if (existing) return this.toCheckoutResult(existing);
      }
      throw e;
    }
  }
}
