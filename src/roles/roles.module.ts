import { Module } from '@nestjs/common';
import { RoleService } from './roles.service';
import { rolesProviders } from './roles.providers';
import { Role } from './roles.entity';
import { RoleController } from './roles.controller';

@Module({
  providers: [RoleService, Role, ...rolesProviders],
  controllers: [RoleController],
  exports: [RoleService],
})
export class RoleModule {}
