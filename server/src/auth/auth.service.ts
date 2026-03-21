import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes, createHash } from 'crypto';
import { UsersService } from '../users/users.service';
import { JWT_EXPIRES_IN } from '../common/auth/auth.constants';
import type { JwtPayload } from '../common/auth/jwt.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new BadRequestException('Email already exists');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.usersService.createUser({
      email,
      passwordHash,
      role: 'user',
    });

    return this.issueToken(user.id, user.email, user.role);
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    return this.issueToken(user.id, user.email, user.role);
  }

  private async issueToken(
    userId: string,
    email: string,
    role: 'user' | 'admin',
  ) {
    const payload: JwtPayload = { sub: userId, email, role };
    const accessToken = await this.jwtService.signAsync(payload);

    const user = await this.usersService.findById(userId);
    return {
      accessToken,
      expiresIn: JWT_EXPIRES_IN,
      user: user
        ? {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            phone: user.phone,
            address: user.address,
            role: user.role,
          }
        : null,
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    // Do not reveal whether user exists
    if (!user) return { ok: true };

    const token = randomBytes(24).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await this.usersService.setResetPasswordToken(
      user.id,
      tokenHash,
      expiresAt,
    );

    // Dev-mode: return token so frontend can proceed.
    // In production, send token via email.
    return { ok: true, token };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const user = await this.usersService.findByResetTokenHash(tokenHash);
    if (!user) throw new BadRequestException('Invalid token');

    if (
      !user.resetPasswordTokenExpiresAt ||
      user.resetPasswordTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException('Token expired');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(user.id, passwordHash);
    await this.usersService.clearResetPasswordToken(user.id);

    return { ok: true };
  }
}
