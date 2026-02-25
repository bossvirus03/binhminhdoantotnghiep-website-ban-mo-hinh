import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateContactDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  message!: string;
}
