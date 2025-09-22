import { IsEmail, IsOptional, IsString, IsUrl, MinLength, Matches } from 'class-validator';

export class UserDTO {
  readonly name: string;
  readonly email: string;
  readonly password: string;
}
export class CreateUserDto {
  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  // Ví dụ validate số điện thoại cơ bản (có thể chỉnh theo nhu cầu)
  @Matches(/^[0-9+\-\s]{6,20}$/, { message: 'phone_number không hợp lệ' })
  phone_number?: string;

  @IsString()
  @MinLength(6, { message: 'password tối thiểu 6 ký tự' })
  password!: string;

  @IsOptional()
  @IsUrl({}, { message: 'avatar_url phải là URL hợp lệ' })
  avatar_url?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  // Ví dụ validate số điện thoại cơ bản (có thể chỉnh theo nhu cầu)
  @Matches(/^[0-9+\-\s]{6,20}$/, { message: 'phone_number không hợp lệ' })
  phone_number?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'password tối thiểu 6 ký tự' })
  password!: string;

  @IsOptional()
  @IsUrl({}, { message: 'avatar_url phải là URL hợp lệ' })
  avatar_url?: string;
}
