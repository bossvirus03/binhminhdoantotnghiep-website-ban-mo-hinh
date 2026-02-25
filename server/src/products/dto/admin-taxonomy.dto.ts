import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class AdminCreateBrandDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;
}

export class AdminUpdateBrandDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name?: string;
}

export class AdminCreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;
}

export class AdminUpdateCategoryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name?: string;
}
