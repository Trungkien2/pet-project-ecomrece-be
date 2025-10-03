import { Injectable } from '@nestjs/common';
import { RolePermission } from './role-permission.entity';

import { CrudService } from 'src/core/Base/crud.service';
import {
  CreateRolePermissionDTO,
  DeleteRolePermissionDTO,
} from './role-permission.dto';
import { AuthException } from 'src/core/exception';
import { EXCEPTION } from 'src/core/exception/exception';
import { Permission } from 'src/permission/permission.entity';
import { Role } from 'src/role/role.entity';

@Injectable()
export class RolePermissionService extends CrudService<RolePermission> {
  constructor() {
    super(RolePermission);
  }

  async create(dto: CreateRolePermissionDTO): Promise<RolePermission> {
    const t = await this.transaction();
    try {
      if (!dto.role_id || !dto.permission_id) {
        throw new AuthException(EXCEPTION.PERMISSION_ID_AND_ROLE_ID_IS_REQUIRED);
      }

      const [rolePermission, permissionExist, roleExist] = await Promise.all([
        RolePermission.findOne({
          where: {
            permission_id: dto.permission_id,
            role_id: dto.role_id,
          },
          transaction: t,
        }),
        Permission.findOne({
          where: { id: dto.permission_id },
          transaction: t,
        }),
        Role.findOne({
          where: { id: dto.role_id },
          transaction: t,
        }),
      ]);

      if (rolePermission) {
        throw new AuthException(EXCEPTION.ROLE_PERMISSION_ALREADY_EXIST);
      }
      if (!permissionExist) {
        throw new AuthException(EXCEPTION.PERMISSION_NOT_FOUND);
      }
      if (!roleExist) {
        throw new AuthException(EXCEPTION.ROLE_NOT_FOUND);
      }
      const newRolePermission = await RolePermission.create(
        {
          permission_id: dto.permission_id,
          role_id: dto.role_id,
        },
        { transaction: t },
      );
      await t.commit();
      return newRolePermission;
    } catch (error) {
      await t.rollback();
      console.log('Error in create permission role: ', error);
      throw error;
    }
  }

  async findByPk(permission_id: number, role_id: number): Promise<RolePermission | null> {
    try {
      if (!permission_id || !role_id) {
        throw new AuthException(EXCEPTION.PERMISSION_ID_AND_ROLE_ID_IS_REQUIRED);
      }
      const rolePermission = await RolePermission.findOne({
        where: {
          permission_id,
          role_id,
        },
      });
      if (!rolePermission) throw new AuthException(EXCEPTION.ROLE_PERMISSION_IS_NOT_FOUND);
      return rolePermission;
    } catch (error) {
      console.log('Error in findByPk permission role:', error);
      throw error;
    }
  }

  async findAll(): Promise<RolePermission[] | null> {
    try {
      const rolePermission = await RolePermission.findAll();
      return rolePermission;
    } catch (error) {
      console.log('Error in findAll permission role: ', error);
    }
  }

  async deleteRolePermission(dto: DeleteRolePermissionDTO): Promise<any> {
    const t = await this.transaction();
    try {
      const rolePermission = await RolePermission.destroy({
        where: { permission_id: dto.permission_id, role_id: dto.role_id },
        transaction: t,
      });
      if (rolePermission === 0) {
        throw new AuthException(EXCEPTION.ROLE_PERMISSION_IS_NOT_FOUND);
      }
      await t.commit();
      return rolePermission;
    } catch (error) {
      await t.rollback();
      console.log('Error in deleteRolePermission: ', error);
      throw error;
    }
  }
}
