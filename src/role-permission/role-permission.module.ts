import { Module } from '@nestjs/common';
import { RolePermissionService } from './role-permission.service';
import { rolePermissionsProviders } from './role-permission.providers';
import { RolePermission } from './role-permission.entity';
import { RolePermissionController } from './role-permission.controller';

@Module({
  providers: [RolePermissionService, RolePermission],
  controllers: [RolePermissionController],
  exports: [RolePermissionService],
})
export class RolePermissionModule {}
