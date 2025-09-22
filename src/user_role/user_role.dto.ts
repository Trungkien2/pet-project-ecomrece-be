import {
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
  IsInt,
  Min,
} from 'class-validator';

export class AddUserRoleDto {
  @IsInt()
  @Min(1)
  userId!: number;

  @IsInt()
  @Min(1)
  roleId!: number;
}

export class AssignRolesDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  roleIds!: number[];
}
