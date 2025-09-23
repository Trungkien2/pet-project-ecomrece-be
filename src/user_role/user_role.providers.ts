import { User } from '../users/user.entity';
import { Role } from '../roles/roles.entity';
import { UserRole } from '../user_role/user_role.entity';
import { USER_ROLE_REPOSITORY, USER_REPOSITORY, ROLE_REPOSITORY  } from 'src/core/contants';

export const userRoleProviders = [
  { provide: USER_ROLE_REPOSITORY, useValue: UserRole },
  { provide: USER_REPOSITORY, useValue: User },
  { provide: ROLE_REPOSITORY, useValue: Role },
];
