import { Permission } from './permission.entity';
import { PERMISSION_REPOSITORY } from 'src/core/contants';
export const permissionProviders = [
  {
    provide: PERMISSION_REPOSITORY,
    useValue: Permission,
  },
];
