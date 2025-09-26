import { Injectable } from '@nestjs/common';
import { UserRole } from './user-role.entity';

import { CrudService } from 'src/core/Base/crud.service';
import {
  CreateUserRoleDTO,
  DeleteUserRoleDTO,
} from './user-role.dto';
import { AuthException } from 'src/core/exception';
import { EXCEPTION } from 'src/core/exception/exception';
import { User } from 'src/user/user.entity';
import { Role } from 'src/role/role.entity';

@Injectable()
export class UserRoleService extends CrudService<UserRole> {
  constructor() {
    super(UserRole);
  }

  async create(dto: CreateUserRoleDTO): Promise<UserRole> {
    const t = await this.transaction();
    try {
      if (!dto.role_id || !dto.user_id) {
        throw new AuthException(EXCEPTION.USER_ID_AND_ROLE_ID_IS_REQUIRED);
      }

      const [userRole, userExist, roleExist] = await Promise.all([
        UserRole.findOne({
          where: {
            user_id: dto.user_id,
            role_id: dto.role_id,
          },
          transaction: t,
        }),
        User.findOne({
          where: { id: dto.user_id },
          transaction: t,
        }),
        Role.findOne({
          where: { id: dto.role_id },
          transaction: t,
        }),
      ]);

      if (userRole) {
        throw new AuthException(EXCEPTION.USER_ROLE_ALREADY_EXIST);
      }
      if (!userExist) {
        throw new AuthException(EXCEPTION.USER_NOT_FOUND);
      }
      if (!roleExist) {
        throw new AuthException(EXCEPTION.ROLE_NOT_FOUND);
      }
      const newUserRole = await UserRole.create(
        {
          user_id: dto.user_id,
          role_id: dto.role_id,
        },
        { transaction: t },
      );
      await t.commit();
      return newUserRole;
    } catch (error) {
      await t.rollback();
      console.log('Error in create user role: ', error);
      throw error;
    }
  }

  async findByPk(user_id: number, role_id: number): Promise<UserRole | null> {
    try {
      if (!user_id || !role_id) {
        throw new AuthException(EXCEPTION.USER_ID_AND_ROLE_ID_IS_REQUIRED);
      }
      const userRole = await UserRole.findOne({
        where: {
          user_id,
          role_id,
        },
      });
      if (!userRole) throw new AuthException(EXCEPTION.USER_ROLE_IS_NOT_FOUND);
      return userRole;
    } catch (error) {
      console.log('Error in findByPk user role:', error);
      throw error;
    }
  }

  async findAll(): Promise<UserRole[] | null> {
    try {
      const userRole = await UserRole.findAll();
      return userRole;
    } catch (error) {
      console.log('Error in findAll user role: ', error);
    }
  }

  async deleteUserRole(dto: DeleteUserRoleDTO): Promise<any> {
    const t = await this.transaction();
    try {
      const userRole = await UserRole.destroy({
        where: { user_id: dto.user_id, role_id: dto.role_id },
        transaction: t,
      });
      if (userRole === 0) {
        throw new AuthException(EXCEPTION.USER_ROLE_IS_NOT_FOUND);
      }
      await t.commit();
      return userRole;
    } catch (error) {
      await t.rollback();
      console.log('Error in deleteUserRole: ', error);
      throw error;
    }
  }
}
