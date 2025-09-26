import { Injectable } from '@nestjs/common';
import { Role } from './role.entity';

import { CrudService } from 'src/core/Base/crud.service';
import { CreateRoleDTO, UpdateRoleDTO } from './role.dto';
import { AuthException } from 'src/core/exception';
import { EXCEPTION } from 'src/core/exception/exception';

@Injectable()
export class RoleService extends CrudService<Role> {
  constructor() {
    super(Role);
  }

  async create(dto: CreateRoleDTO): Promise<Role> {
    const t = await this.transaction();
    try {
      if (dto.name) {
        const existName = await Role.findOne({
          where: { name: dto.name },
        });
        if (existName) {
          throw new AuthException(EXCEPTION.ROLE_NAME_ALREADY_EXIST);
        }
      }
      const newRole = await Role.create(
        {
          name: dto.name,
          description: dto.description,
        },
        { transaction: t, logging: true },
      );
      await t.commit();
      return newRole;
    } catch (error) {
      await t.rollback();
      console.log('Error in create role: ', error);
      throw error;
    }
  }

  async findByPk(id: number): Promise<Role | null> {
    try {
      const role = await Role.findByPk(id);
      if (!role) {
        throw new AuthException(EXCEPTION.ROLE_NOT_FOUND);
      }
      return role;
    } catch (error) {
      console.log('Error in findByPk role: ', error);
      throw error;
    }
  }

  async findAll(): Promise<Role[] | null> {
    try {
      const roles = await Role.findAll();
      return roles;
    } catch (error) {
      console.log('Error in findAll role: ', error);
      throw error;
    }
  }

  async updateRole(id: number, dto: UpdateRoleDTO): Promise<Role> {
    const t = await this.transaction();
    try {
      const role = await Role.findByPk(id, { transaction: t });
      if (!role) {
        throw new AuthException(EXCEPTION.ROLE_NOT_FOUND);
      }
      if (dto.name) {
        const nameExist = await Role.findOne({
          where: { name: dto.name },
          transaction: t,
        });
        if (nameExist) {
          throw new AuthException(EXCEPTION.ROLE_NAME_ALREADY_EXIST);
        }
      }
      await role.update(dto, { transaction: t });

      await t.commit();
      return role;
    } catch (error) {
      await t.rollback();
      console.log('Error in updateRole: ', error);
      throw error;
    }
  }

  async deleteRole(id: number): Promise<any> {
    const t = await this.transaction();
    try {
      const role = await Role.destroy({ where: { id }, transaction: t });
      if (role === 0) {
        throw new AuthException(EXCEPTION.ROLE_NOT_FOUND);
      }
      await t.commit();
      return role;
    } catch (error) {
      await t.rollback();
      console.log('Error in delete role: ', error);
      throw error;
    }
  }
}
