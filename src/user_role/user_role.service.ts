import {
  Injectable, NotFoundException, ConflictException, BadRequestException, Inject,
} from '@nestjs/common';
import { UniqueConstraintError, Op } from 'sequelize';
import { USER_ROLE_REPOSITORY } from 'src/core/contants';
import { UserRole } from './user_role.entity';
import { AddUserRoleDto, AssignRolesDto} from './user_role.dto';
import { User } from '../users/user.entity';
import { Role } from '../roles/roles.entity';

@Injectable()
export class UserRoleService {
  constructor(
    @Inject(USER_ROLE_REPOSITORY) private readonly userRoleModel: typeof UserRole,
  ) {}

  /** Liệt kê roles của 1 user */
  async getRolesByUser(userId: number) {
    const user = await User.findByPk(userId, { include: [Role] });
    if (!user) throw new NotFoundException('User không tồn tại');
    return user ?? [];
  }

  /** Liệt kê users theo 1 role */
  async getUsersByRole(roleId: number) {
    const role = await Role.findByPk(roleId, { include: [User] });
    if (!role) throw new NotFoundException('Role không tồn tại');
    return role ?? [];
  }

  /** Gán 1 role cho 1 user */
  async add(dto: AddUserRoleDto) {
    const [user, role] = await Promise.all([
      User.findByPk(dto.userId),
      Role.findByPk(dto.roleId),
    ]);
    if (!user) throw new NotFoundException('User không tồn tại');
    if (!role) throw new NotFoundException('Role không tồn tại');

    try {
      await this.userRoleModel.create({ user_id: user.id, role_id: role.id });
      return { message: 'Đã gán role cho user' };
    } catch (e: any) {
      if (e instanceof UniqueConstraintError) {
        throw new ConflictException('User đã có role này');
      }
      throw e;
    }
  }

  /** Huỷ gán 1 role khỏi 1 user */
  async remove(userId: number, roleId: number) {
    const count = await this.userRoleModel.destroy({ where: { user_id: userId, role_id: roleId } });
    if (!count) throw new NotFoundException('Quan hệ user-role không tồn tại');
    return { message: 'Đã huỷ gán role khỏi user' };
  }

  /** Overwrite toàn bộ roles cho user (set cứng danh sách) */
  async set(userId: number, dto: AssignRolesDto) {
    if (!Array.isArray(dto.roleIds)) {
      throw new BadRequestException('roleIds phải là mảng');
    }
    const user = await User.findByPk(userId);
    if (!user) throw new NotFoundException('User không tồn tại');

    // validate roleIds tồn tại
    const roles = await Role.findAll({ where: { id: { [Op.in]: dto.roleIds } } });
    if (roles.length !== dto.roleIds.length) {
      throw new BadRequestException('Tồn tại roleId không hợp lệ');
    }

    // tính toán delta
    const current = await this.userRoleModel.findAll({ where: { user_id: userId } });
    const currentSet = new Set(current.map(r => r.role_id));
    const nextSet = new Set(dto.roleIds);

    const toAdd = dto.roleIds.filter(id => !currentSet.has(id));
    const toRemove = [...currentSet].filter(id => !nextSet.has(id));

    if (toAdd.length) {
      await this.userRoleModel.bulkCreate(toAdd.map(role_id => ({ user_id: userId, role_id })));
    }
    if (toRemove.length) {
      await this.userRoleModel.destroy({ where: { user_id: userId, role_id: toRemove } });
    }
    return { added: toAdd, removed: toRemove };
  }
}
