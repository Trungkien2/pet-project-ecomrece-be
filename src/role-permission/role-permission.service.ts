import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UniqueConstraintError } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { RolePermission } from './role-permission.entity';
import { Role } from '../roles/roles.entity'; // TODO: update path
import { Permission } from 'src/permissions/permission.entity';

@Injectable()
export class RolePermissionService {
  constructor() {}

  async listByRole(roleId: number) {
    const role = await Role.findByPk(roleId);
    if (!role) throw new NotFoundException('Role không tồn tại');

    // lấy danh sách permission_id từ bảng nối + join tên permission (nếu cần)
    const rows = await RolePermission.findAll({
      where: { role_id: roleId },
      include: [{ model: Permission, required: false }],
    });
    return rows;
  }

  async add(roleId: number, permissionId: number) {
    const [role, perm] = await Promise.all([
      Role.findByPk(roleId),
      Permission.findByPk(permissionId),
    ]);
    if (!role) throw new NotFoundException('Role không tồn tại');
    if (!perm) throw new NotFoundException('Permission không tồn tại');

    try {
      await RolePermission.create({ role_id: role.id, permission_id: perm.id });
      return { message: 'Đã gán permission cho role' };
    } catch (e) {
      if (e instanceof UniqueConstraintError) {
        throw new ConflictException('Role đã có permission này');
      }
      throw e;
    }
  }

  async remove(roleId: number, permissionId: number) {
    const count = await RolePermission.destroy({
      where: { role_id: roleId, permission_id: permissionId },
    });
    if (!count) {
      throw new NotFoundException('Quan hệ role-permission không tồn tại');
    }
    return { message: 'Đã huỷ gán permission khỏi role' };
  }

  /**
   * Ghi đè toàn bộ danh sách permission cho role
   */
  async set(roleId: number, permissionIds: number[]) {
    if (!Array.isArray(permissionIds)) {
      throw new BadRequestException('permissionIds phải là mảng');
    }
    const role = await Role.findByPk(roleId);
    if (!role) throw new NotFoundException('Role không tồn tại');

    const perms = await Permission.findAll({ where: { id: permissionIds } });
    if (perms.length !== permissionIds.length) {
      throw new BadRequestException('Tồn tại permissionId không hợp lệ');
    }

    const sequelize = RolePermission.sequelize;
    if (!sequelize) {
      throw new InternalServerErrorException('Sequelize chưa được khởi tạo cho RolePermission');
    }
    return sequelize.transaction(async (t) => {
      const current = await RolePermission.findAll({
        where: { role_id: roleId },
        transaction: t,
      });
      const currentSet = new Set(current.map((r) => r.permission_id));
      const nextSet = new Set(permissionIds);

      const toAdd = permissionIds.filter((id) => !currentSet.has(id));
      const toRemove = [...currentSet].filter((id) => !nextSet.has(id));

      if (toAdd.length) {
        await RolePermission.bulkCreate(
          toAdd.map((permission_id) => ({ role_id: roleId, permission_id })),
          { transaction: t },
        );
      }
      if (toRemove.length) {
        await RolePermission.destroy({
          where: { role_id: roleId, permission_id: toRemove },
          transaction: t,
        });
      }
      return { added: toAdd, removed: toRemove };
    });
  }
}
