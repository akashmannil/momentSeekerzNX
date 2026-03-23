import {
  IsString, IsEnum, IsBoolean, IsOptional, IsArray, IsNumber,
  IsInt, Min, IsUrl, IsObject, ValidateNested, MaxLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PhotoCategory } from '../enums';

export class PhotoMetadataDto {
  @IsOptional() @IsString() camera?: string;
  @IsOptional() @IsString() lens?: string;
  @IsOptional() @IsNumber() iso?: number;
  @IsOptional() @IsString() aperture?: string;
  @IsOptional() @IsString() shutterSpeed?: string;
  @IsOptional() @IsString() location?: string;
}

export class CreatePhotoDto {
  @IsString()
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsUrl()
  imageUrl!: string;

  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;

  @IsOptional()
  @IsUrl()
  webpUrl?: string;

  @IsEnum(PhotoCategory)
  category!: PhotoCategory;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PhotoMetadataDto)
  metadata?: PhotoMetadataDto;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdatePhotoDto {
  @IsOptional() @IsString() @MaxLength(120) title?: string;
  @IsOptional() @IsString() @MaxLength(500) description?: string;
  @IsOptional() @IsEnum(PhotoCategory) category?: PhotoCategory;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsBoolean() featured?: boolean;
  @IsOptional() @IsBoolean() published?: boolean;
  @IsOptional() @IsObject() @ValidateNested() @Type(() => PhotoMetadataDto) metadata?: PhotoMetadataDto;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}

export class GalleryQueryDto {
  @IsOptional() @Transform(({ value }) => Number(value)) @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @Transform(({ value }) => Number(value)) @IsInt() @Min(1) limit?: number = 20;
  @IsOptional() @IsEnum(PhotoCategory) category?: PhotoCategory;
  @IsOptional() @Transform(({ value }) => value === 'true') @IsBoolean() featured?: boolean;
  @IsOptional() @Transform(({ value }) => value === 'true') @IsBoolean() published?: boolean;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() tag?: string;
}
