import { RolePermission } from './role-permission.entity';
import { Role } from '../roles/roles.entity';
import { Permission } from '../permissions/permission.entity';
import {
  ROLE_PERMISSION_REPOSITORY,
  USER_REPOSITORY,
  ROLE_REPOSITORY,
} from 'src/core/contants';

export const rolePermissionProviders = [
  { provide: ROLE_PERMISSION_REPOSITORY, useValue: RolePermission },
  { provide: USER_REPOSITORY, useValue: Permission },
  { provide: ROLE_REPOSITORY, useValue: Role },
];
