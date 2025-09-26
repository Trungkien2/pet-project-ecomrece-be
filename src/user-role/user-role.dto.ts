import { IsNumber, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UserRoleDTO {
  readonly user_id: number;
  readonly role_id: number;
}
export class CreateUserRoleDTO {
  @ApiProperty()
  @Type(() => Number)
  @IsInt({ message: 'user_id phải là số nguyên' })
  @Min(1, { message: 'user_id tối thiểu là 1' })
  @IsNotEmpty()
  user_id!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt({ message: 'role_id phải là số nguyên' })
  @Min(1, { message: 'role_id tối thiểu là 1' })
  @IsNotEmpty()
  role_id!: number;
}

export class DeleteUserRoleDTO {
  @ApiProperty()
  @Type(() => Number)
  @IsInt({ message: 'user_id phải là số nguyên' })
  @Min(1, { message: 'user_id tối thiểu là 1' })
  @IsNotEmpty()
  user_id!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt({ message: 'role_id phải là số nguyên' })
  @Min(1, { message: 'role_id tối thiểu là 1' })
  @IsNotEmpty()
  role_id!: number;
}

export class FindUserRoleQueryDTO {
  @Type(() => Number)
  @IsInt({ message: 'user_id phải là số nguyên' })
  @Min(1, { message: 'user_id tối thiểu là 1' })
  @IsNotEmpty({ message: 'user_id là bắt buộc' })
  user_id!: number;

  @Type(() => Number)
  @IsInt({ message: 'role_id phải là số nguyên' })
  @Min(1, { message: 'role_id tối thiểu là 1' })
  @IsNotEmpty({ message: 'role_id là bắt buộc' })
  role_id!: number;
}
