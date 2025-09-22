import { Module, forwardRef } from '@nestjs/common';
import { UserRoleService } from './user_role.service';
import { userRoleProviders } from './user_role.providers';
import { UserRole } from './user_role.entity';
import { UserRoleController } from './user_role.controller';
import { UserModule } from '../users/user.module'; // 🔁 chỉnh path theo dự án
import { RoleModule } from '../roles/roles.module'; // 🔁 chỉnh path

@Module({
  imports: [forwardRef(() => UserModule), forwardRef(() => RoleModule)],
  providers: [UserRoleService, UserRole, ...userRoleProviders],
  controllers: [UserRoleController],
  exports: [UserRoleService],
})
export class UserRoleModule {}
