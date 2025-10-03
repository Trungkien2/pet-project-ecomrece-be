import { IsNumber, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class RolePermissionDTO {
  readonly permission_id: number;
  readonly role_id: number;
}
export class CreateRolePermissionDTO {
  @ApiProperty()
  @Type(() => Number)
  @IsInt({ message: 'permission_id phải là số nguyên' })
  @Min(1, { message: 'permission_id tối thiểu là 1' })
  @IsNotEmpty()
  permission_id!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt({ message: 'role_id phải là số nguyên' })
  @Min(1, { message: 'role_id tối thiểu là 1' })
  @IsNotEmpty()
  role_id!: number;
}

export class DeleteRolePermissionDTO {
  @ApiProperty()
  @Type(() => Number)
  @IsInt({ message: 'permission_id phải là số nguyên' })
  @Min(1, { message: 'permission_id tối thiểu là 1' })
  @IsNotEmpty()
  permission_id!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt({ message: 'role_id phải là số nguyên' })
  @Min(1, { message: 'role_id tối thiểu là 1' })
  @IsNotEmpty()
  role_id!: number;
}

export class FindRolePermissionQueryDTO {
  @Type(() => Number)
  @IsInt({ message: 'permission_id phải là số nguyên' })
  @Min(1, { message: 'permission_id tối thiểu là 1' })
  @IsNotEmpty({ message: 'permission_id là bắt buộc' })
  permission_id!: number;

  @Type(() => Number)
  @IsInt({ message: 'role_id phải là số nguyên' })
  @Min(1, { message: 'role_id tối thiểu là 1' })
  @IsNotEmpty({ message: 'role_id là bắt buộc' })
  role_id!: number;
}
