import { IsString, IsInt, Min, Max, IsArray, ArrayMaxSize, ArrayMinSize, IsEmail, IsOptional, MaxLength, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PricingTier } from '../enums';

export class AddCartItemDto {
  @IsString()
  @MaxLength(64)
  serviceId!: string;

  @IsInt()
  @Min(1)
  @Max(20)
  quantity!: number;
}

export class UpdateCartItemDto {
  @IsInt()
  @Min(1)
  @Max(20)
  quantity!: number;
}

export class CartItemInputDto {
  @IsString()
  @MaxLength(64)
  serviceId!: string;

  @IsInt()
  @Min(1)
  @Max(20)
  quantity!: number;
}

export class CheckoutServicesDto {
  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  customerName?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => CartItemInputDto)
  items!: CartItemInputDto[];
}

export class CheckoutSubscriptionDto {
  @IsEnum(PricingTier)
  tier!: PricingTier;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  customerName?: string;
}
