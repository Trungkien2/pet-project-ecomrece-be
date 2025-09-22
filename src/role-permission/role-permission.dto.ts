import {
  IsInt,
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
  Min,
} from 'class-validator';

export class AddPermissionRoleDto {
  @IsInt()
  @Min(1)
  permissionId!: number;

  @IsInt()
  @Min(1)
  roleId!: number;
}

export class SetPermissionsForRoleDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  permissionIds!: number[];
}
