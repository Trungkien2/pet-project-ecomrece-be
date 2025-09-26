import { IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class PermissionDTO {
  readonly name: string;
  readonly description: string;
}
export class CreatePermissionDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdatePermissionDTO extends PartialType (CreatePermissionDTO) {
  
}