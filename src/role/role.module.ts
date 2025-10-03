import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { rolesProviders } from './role.providers';
import { Role } from './role.entity';
import { RoleController } from './role.controller';

@Module({
  providers: [RoleService, Role],
  controllers: [RoleController],
  exports: [RoleService],
})
export class RoleModule {}
