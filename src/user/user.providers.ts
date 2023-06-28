import { User } from './user.entity';
import { USER_REPOSITORY } from 'src/core/contants';
export const usersProviders = [
  {
    provide: USER_REPOSITORY,
    useValue: User,
  },
];
