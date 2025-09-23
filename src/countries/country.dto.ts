// src/modules/country/dto/create-country.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, Length, Matches } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types'; // CHANGE: dùng mapped-types thuần Nest thay vì swagger
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCountryDto {
  @ApiProperty({
    example: 'VN',
    description: 'Mã quốc gia ISO-3166-1 alpha-2 (2 ký tự chữ)',
    minLength: 2,
    maxLength: 2,
  })
  @IsString()
  @Length(2, 2)
  @Matches(/^[A-Za-z]{2}$/, { message: 'iso2 phải gồm 2 ký tự chữ A-Z' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value)) 
  iso2!: string;

  @ApiProperty({
    example: 'Vietnam',
    maxLength: 255,
  })
  @IsString()
  @Length(1, 255)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value)) // CHANGE: trim tên
  name!: string;
}

export class UpdateCountryDto extends PartialType(CreateCountryDto) {
  // CHANGE: Cho phép cập nhật từng phần, nhưng vẫn validate như create

  @ApiPropertyOptional({
    example: 'VN',
    description: 'Mã quốc gia ISO-3166-1 alpha-2 (2 ký tự chữ)',
    minLength: 2,
    maxLength: 2,
  })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  @Matches(/^[A-Za-z]{2}$/, { message: 'iso2 phải gồm 2 ký tự chữ A-Z' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  iso2?: string;

  @ApiPropertyOptional({
    example: 'Viet Nam',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name?: string;
}

