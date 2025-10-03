import { Module } from '@nestjs/common';
import { UserRoleService } from './user-role.service';
import { userRolesProviders } from './user-role.providers';
import { UserRole } from './user-role.entity';
import { UserRoleController } from './user-role.controller';

@Module({
  providers: [UserRoleService, UserRole],
  controllers: [UserRoleController],
  exports: [UserRoleService],
})
export class UserRoleModule {}
