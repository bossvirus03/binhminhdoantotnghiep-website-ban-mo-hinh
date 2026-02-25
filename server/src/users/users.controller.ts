import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CurrentUser } from '../common/auth/current-user.decorator';
import type { CurrentUserInfo } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: CurrentUserInfo) {
    const u = await this.usersService.findById(user.id);
    return u
      ? {
          id: u.id,
          email: u.email,
          fullName: u.fullName,
          phone: u.phone,
          address: u.address,
          role: u.role,
        }
      : null;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(
    @CurrentUser() user: CurrentUserInfo,
    @Body() dto: UpdateProfileDto,
  ) {
    const u = await this.usersService.updateProfile(user.id, dto);
    return u
      ? {
          id: u.id,
          email: u.email,
          fullName: u.fullName,
          phone: u.phone,
          address: u.address,
          role: u.role,
        }
      : null;
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @CurrentUser() user: CurrentUserInfo,
    @Body() dto: ChangePasswordDto,
  ) {
    const u = await this.usersService.findById(user.id);
    if (!u) return { ok: false };

    const ok = await bcrypt.compare(dto.currentPassword, u.passwordHash);
    if (!ok) return { ok: false, message: 'Current password is incorrect' };

    const newHash = await bcrypt.hash(dto.newPassword, 10);
    await this.usersService.updatePassword(user.id, newHash);
    return { ok: true };
  }
}
