import {
  IsString, IsEmail, IsEnum, IsDateString, IsOptional,
  IsPhoneNumber, MaxLength, IsNumber, Min,
} from 'class-validator';
import { SessionType, BookingStatus } from '../enums';

export class CreateBookingDto {
  @IsString()
  @MaxLength(100)
  clientName!: string;

  @IsEmail()
  clientEmail!: string;

  @IsString()
  clientPhone!: string;

  @IsEnum(SessionType)
  sessionType!: SessionType;

  @IsDateString()
  preferredDate!: string;

  @IsOptional()
  @IsDateString()
  alternateDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}

export class UpdateBookingDto {
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  adminNotes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quotedPrice?: number;

  @IsOptional()
  @IsDateString()
  confirmedDate?: string;
}
