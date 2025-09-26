import { IsEmail, IsOptional, IsString, IsNotEmpty, IsStrongPassword, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class UserDTO {
  readonly full_name: string;
  readonly email: string;
  readonly password: string;
}

export class CreateUserDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
  
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone_number?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsUrl()
  @IsOptional()
  avatar_url?: string;
}

export class UpdateUserDTO extends PartialType (CreateUserDTO) {
  
}