import {
  IsString, IsArray, IsEnum, IsNumber, IsBoolean, IsOptional,
  ValidateNested, Min, IsInt, IsUrl, IsEmail, MaxLength, ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PrintSize, PrintFinish } from '../enums';

export class ProductVariantDto {
  @IsEnum(PrintSize)
  size!: PrintSize;

  @IsEnum(PrintFinish)
  finish!: PrintFinish;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsInt()
  stock?: number;

  @IsString()
  sku!: string;
}

export class CreateProductDto {
  @IsString()
  @MaxLength(150)
  title!: string;

  @IsString()
  @MaxLength(1000)
  description!: string;

  @IsUrl()
  imageUrl!: string;

  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  photoId?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants!: ProductVariantDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}

export class UpdateProductDto {
  @IsOptional() @IsString() @MaxLength(150) title?: string;
  @IsOptional() @IsString() @MaxLength(1000) description?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ProductVariantDto) variants?: ProductVariantDto[];
  @IsOptional() @IsBoolean() published?: boolean;
  @IsOptional() @IsBoolean() featured?: boolean;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
}

export class OrderItemDto {
  @IsString()
  productId!: string;

  @IsEnum(PrintSize)
  size!: PrintSize;

  @IsEnum(PrintFinish)
  finish!: PrintFinish;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @IsEmail()
  customerEmail!: string;

  @IsString()
  @MaxLength(100)
  customerName!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}
