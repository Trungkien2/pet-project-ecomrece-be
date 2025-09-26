import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { permissionsProviders } from './permission.providers';
import { Permission } from './permission.entity';
import { PermissionController } from './permission.controller';

@Module({
  providers: [PermissionService, Permission],
  controllers: [PermissionController],
  exports: [PermissionService],
})
export class PermissionModule {}
