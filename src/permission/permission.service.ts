import { Injectable } from '@nestjs/common';
import { Permission } from './permission.entity';

import { CrudService } from 'src/core/Base/crud.service';
import { CreatePermissionDTO, UpdatePermissionDTO } from './permission.dto';
import { AuthException } from 'src/core/exception';
import { EXCEPTION } from 'src/core/exception/exception';

@Injectable()
export class PermissionService extends CrudService<Permission> {
  constructor() {
    super(Permission);
  }

  async create(dto: CreatePermissionDTO): Promise<Permission> {
    const t = await this.transaction();
    try {
      if (dto.name) {
        const existName = await Permission.findOne({
          where: { name: dto.name },
        });
        if (existName) {
          throw new AuthException(EXCEPTION.PERMISSION_NAME_ALREADY_EXIST);
        }
      }
      const newPermission = await Permission.create(
        {
          name: dto.name,
          description: dto.description,
        },
        { transaction: t, logging: true },
      );
      await t.commit();
      return newPermission;
    } catch (error) {
      await t.rollback();
      console.log('Error in create permission: ', error);
      throw error;
    }
  }

  async findByPk(id: number): Promise<Permission | null> {
    try {
      const permission = await Permission.findByPk(id);
      if (!permission) {
        throw new AuthException(EXCEPTION.PERMISSION_NOT_FOUND);
      }
      return permission;
    } catch (error) {
      console.log('Error in findByPk permission: ', error);
      throw error;
    }
  }

  async findAll(): Promise<Permission[] | null> {
    try {
      const permissions = await Permission.findAll();
      return permissions;
    } catch (error) {
      console.log('Error in findAll permission: ', error);
      throw error;
    }
  }

  async updatePermission(id: number, dto: UpdatePermissionDTO): Promise<Permission> {
    const t = await this.transaction();
    try {
      const permission = await Permission.findByPk(id, { transaction: t });
      if (!permission) {
        throw new AuthException(EXCEPTION.PERMISSION_NOT_FOUND);
      }
      if (dto.name) {
        const nameExist = await Permission.findOne({
          where: { name: dto.name },
          transaction: t,
        });
        if (nameExist) {
          throw new AuthException(EXCEPTION.PERMISSION_NAME_ALREADY_EXIST);
        }
      }
      await permission.update(dto, { transaction: t });

      await t.commit();
      return permission;
    } catch (error) {
      await t.rollback();
      console.log('Error in updatePermission: ', error);
      throw error;
    }
  }

  async deletePermission(id: number): Promise<any> {
    const t = await this.transaction();
    try {
      const permission = await Permission.destroy({ where: { id }, transaction: t });
      if (permission === 0) {
        throw new AuthException(EXCEPTION.PERMISSION_NOT_FOUND);
      }
      await t.commit();
      return permission;
    } catch (error) {
      await t.rollback();
      console.log('Error in delete permission: ', error);
      throw error;
    }
  }
}
