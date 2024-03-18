import { Routes } from '@nestjs/core';
import { UserModule } from './user/user.module';

const allModuleV1 = [UserModule];

export const ApiRoute: Routes = [
  {
    path: 'api',
    children: [
      {
        path: 'v1',
        children: allModuleV1,
      },
    ],
  },
];
export const allModule = [...allModuleV1];
