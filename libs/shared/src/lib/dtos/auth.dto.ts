import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;
}

export class RefreshTokenDto {
  @IsString()
  userId!: string;

  @IsString()
  refreshToken!: string;
}
