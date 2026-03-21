import { Injectable } from '@nestjs/common';
import type { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async createUser(input: { email: string; passwordHash: string; role: Role }) {
    return this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        role: input.role,
        fullName: '',
        phone: '',
        address: '',
      },
    });
  }

  async updateProfile(
    userId: string,
    patch: { fullName?: string; phone?: string; address?: string },
  ) {
    return this.prisma.user.update({ where: { id: userId }, data: patch });
  }

  async updatePassword(userId: string, passwordHash: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async setResetPasswordToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        resetPasswordTokenHash: tokenHash,
        resetPasswordTokenExpiresAt: expiresAt,
      },
    });
  }

  findByResetTokenHash(tokenHash: string) {
    return this.prisma.user.findFirst({
      where: { resetPasswordTokenHash: tokenHash },
    });
  }

  async clearResetPasswordToken(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { resetPasswordTokenHash: null, resetPasswordTokenExpiresAt: null },
    });
  }
}
