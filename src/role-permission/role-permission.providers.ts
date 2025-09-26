import { RolePermission } from './role-permission.entity';
import { ROLE_PERMISSION_REPOSITORY } from 'src/core/contants';
export const rolePermissionsProviders = [
  {
    provide: ROLE_PERMISSION_REPOSITORY,
    useValue: RolePermission,
  },
];
