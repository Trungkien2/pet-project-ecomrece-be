import { Module, forwardRef } from '@nestjs/common';
import { RolePermissionService } from './role-permission.service';
import { RolePermission } from './role-permission.entity';
import { RolePermissionController } from './role-permission.controller';
import { UserModule } from '../users/user.module'; // 🔁 chỉnh path theo dự án
import { RoleModule } from '../roles/roles.module'; // 🔁 chỉnh path
import { PermissionModule } from '../permissions/permission.module';

@Module({
  imports: [forwardRef(() => PermissionModule), forwardRef(() => RoleModule)],
  providers: [RolePermissionService],
  controllers: [RolePermissionController],
  exports: [RolePermissionService],
})
export class RolePermissionModule {}
