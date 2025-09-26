import { Permission } from './permission.entity';
import { PERMISSION_REPOSITORY } from 'src/core/contants';
export const permissionsProviders = [
  {
    provide: PERMISSION_REPOSITORY,
    useValue: Permission,
  },
];
