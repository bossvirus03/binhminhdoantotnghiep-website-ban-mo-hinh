import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type CurrentUserInfo = {
  id: string;
  email: string;
  role: 'user' | 'admin';
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserInfo => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as {
      sub?: string;
      email?: string;
      role?: 'user' | 'admin';
    };

    return {
      id: user?.sub ?? '',
      email: user?.email ?? '',
      role: user?.role ?? 'user',
    };
  },
);
