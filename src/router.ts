import { Routes } from '@nestjs/core';
import { UserModule } from './users/user.module';
import { RoleModule } from './roles/roles.module';
import { UserRoleModule } from './user_role/user_role.module';
import { PermissionModule } from './permissions/permission.module';
import { RolePermissionModule } from './role-permission/role-permission.module';
import { CountryModule } from './countries/country.module';

const allModuleV1 = [UserModule, RoleModule, UserRoleModule, PermissionModule, RolePermissionModule, CountryModule];

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
