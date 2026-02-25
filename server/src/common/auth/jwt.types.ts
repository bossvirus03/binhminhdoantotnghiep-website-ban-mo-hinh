export type JwtPayload = {
  sub: string;
  email: string;
  role: 'user' | 'admin';
};
