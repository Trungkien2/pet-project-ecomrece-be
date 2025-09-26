import { Routes } from '@nestjs/core';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';
import { UserRoleModule } from './user-role/user-role.module';
import { RolePermissionModule } from './role-permission/role-permission.module';

const allModuleV1 = [UserModule, RoleModule, PermissionModule, UserRoleModule, RolePermissionModule];

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
