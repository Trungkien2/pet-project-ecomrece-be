import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UniqueConstraintError } from 'sequelize';
import { Role } from './roles.entity';
import { CrudService } from 'src/core/Base/crud.service';
import { CreateRoleDto, UpdateRoleDto } from './roles.dto';
import { FindOptions, WhereOptions } from 'sequelize';

@Injectable()
export class RoleService extends CrudService<Role> {
  constructor() {
    super(Role);
  }

  async create(dto: CreateRoleDto): Promise<Role> {
    if (!dto.name?.trim()) {
      throw new BadRequestException('Cần cung cấp tên role');
    }

    try {
      const role = await Role.create({
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
      });
      return role;
    } catch (err: any) {
      if (err instanceof UniqueConstraintError) {
        throw new ConflictException('Role đã tồn tại');
      }
      throw err;
    }
  }

  async findAll(): Promise<Role[]> {
    return Role.findAll({
      order: [['id', 'DESC']],
    });
  }

  async findOne(where: WhereOptions<Role>): Promise<Role | null> {
    const options: FindOptions = {
      where,
    };
    return Role.findOne(options);
  }

  async findOneById(id: number): Promise<Role> {
    const role = await Role.findByPk(id);
    if (!role) throw new NotFoundException('Role không tồn tại');
    return role;
  }

  async updateRole(id: number, dto: UpdateRoleDto) {
    const role = await Role.findByPk(id);
    if (!role) throw new NotFoundException('Role không tồn tại');

    //Check unique nếu thay đổi name
    if(dto.name && dto.name !== role.name) {
      const existRole = await Role.findOne({
        where: {name: dto.name},
      })
      if (existRole && existRole.id !== id) {
        throw new ConflictException('Name đã tồn tại');
      }
    } 

    // Chuẩn bị payload cập nhật
    const payload: Partial<Role> = {
      description: dto.description ?? role.description,
    };
    return role.update(payload);
  }

  async deleteRole(id: number): Promise<{ message: string }> {
    try {
      const affected = await Role.destroy({ where: { id } });
      if (!affected) {
        throw new NotFoundException('Role không tồn tại');
      }
      return { message: `Xoá role #${id} thành công` };
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
