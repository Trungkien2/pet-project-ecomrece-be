import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UniqueConstraintError } from 'sequelize';
import { Permission } from './permission.entity';
import { CrudService } from 'src/core/Base/crud.service';
import { CreatePermissionDto, UpdatePermissionDto } from './permission.dto';
import { FindOptions, WhereOptions } from 'sequelize';

@Injectable()
export class PermissionService extends CrudService<Permission> {
  constructor() {
    super(Permission);
  }

  async create(dto: CreatePermissionDto): Promise<Permission> {
    if (!dto.name?.trim()) {
      throw new BadRequestException('Cần cung cấp tên permission');
    }

    try {
      const permission = await Permission.create({
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
      });
      return permission;
    } catch (err: any) {
      if (err instanceof UniqueConstraintError) {
        throw new ConflictException('Permission đã tồn tại');
      }
      throw err;
    }
  }

  async findAll(): Promise<Permission[]> {
    return Permission.findAll({
      order: [['id', 'DESC']],
    });
  }

  async findOne(where: WhereOptions<Permission>): Promise<Permission | null> {
    const options: FindOptions = {
      where,
    };
    return Permission.findOne(options);
  }

  async findOneById(id: number): Promise<Permission> {
    const permission = await Permission.findByPk(id);
    if (!permission) throw new NotFoundException('Permission không tồn tại');
    return permission;
  }

  async updatePermission(id: number, dto: UpdatePermissionDto) {
    const permission = await Permission.findByPk(id);
    if (!permission) throw new NotFoundException('Permission không tồn tại');

    //Check unique nếu thay đổi name
    if(dto.name && dto.name !== permission.name) {
      const existName = await Permission.findOne({
        where: {name: dto.name},
      });
      if(existName && existName.id !== id) {
        throw new ConflictException('Name đã tồn tại');
      }
    }

    // Chuẩn bị payload cập nhật
    const payload: Partial<Permission> = {
      description: dto.description ?? permission.description,
    };
    return permission.update(payload);
  }

  async deletePermission(id: number): Promise<{ message: string }> {
    try {
      const affected = await Permission.destroy({ where: { id } });
      if (!affected) {
        throw new NotFoundException('Permission không tồn tại');
      }
      return { message: `Xoá permission #${id} thành công` };
    } catch (err: any) {
      if (err?.name === 'SequelizeForeignKeyConstraintError') {
        throw new BadRequestException(
          'Không thể xoá do ràng buộc dữ liệu liên quan',
        );
      }
      throw err;
    }
  }
}
