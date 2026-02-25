import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  create(input: { name?: string; email?: string; phone?: string; message: string }) {
    return this.prisma.contactMessage.create({
      data: {
        name: input.name ?? '',
        email: input.email ?? '',
        phone: input.phone ?? '',
        message: input.message,
      },
    });
  }
}
