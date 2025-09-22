import { Role } from './roles.entity';
import { ROLE_REPOSITORY } from 'src/core/contants';
export const rolesProviders = [
  {
    provide: ROLE_REPOSITORY,
    useValue: Role,
  },
];
