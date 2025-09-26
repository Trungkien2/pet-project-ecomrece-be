import { UserRole } from './user-role.entity';
import { USER_ROLE_REPOSITORY } from 'src/core/contants';
export const userRolesProviders = [
  {
    provide: USER_ROLE_REPOSITORY,
    useValue: UserRole,
  },
];
