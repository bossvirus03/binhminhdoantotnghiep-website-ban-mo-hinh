export const JWT_SECRET = process.env.JWT_SECRET ?? 'dev_jwt_secret_change_me';

// Nest's JwtModule uses the `ms` StringValue type which is narrower than `string`.
// We cast env string to the compatible type.
export const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ??
  '7d') as unknown as number | import('ms').StringValue;
