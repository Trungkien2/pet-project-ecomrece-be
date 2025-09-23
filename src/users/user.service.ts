import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { CrudService } from 'src/core/Base/crud.service';
import * as bcrypt from 'bcrypt';
import { FindOptions, WhereOptions } from 'sequelize';

@Injectable()
export class UserService extends CrudService<User> {
  constructor() {
    super(User);
  }

  async create(dto: CreateUserDto): Promise<User> {
    // Ít nhất phải có email hoặc phone
    if (!dto.email && !dto.phone_number) {
      throw new BadRequestException('Cần cung cấp email hoặc phone_number');
    }

    // Kiểm tra trùng email/phone nếu có
    if (dto.email) {
      const existEmail = await User.findOne({ where: { email: dto.email } });
      if (existEmail) {
        throw new ConflictException('Email đã tồn tại');
      }
    }

    if (dto.phone_number) {
      const existPhone = await User.findOne({
        where: { phone_number: dto.phone_number },
      });
      if (existPhone) {
        throw new ConflictException('Số điện thoại đã tồn tại');
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(dto.password, salt);

    // Tạo user
    const user = await User.create({
      full_name: dto.full_name,
      email: dto.email,
      phone_number: dto.phone_number,
      avatar_url: dto.avatar_url,
      password_hash, // [CHANGED]
    });

    return user;
  }

  async findAll(): Promise<User[]> {
    return User.findAll({
      attributes: { exclude: ['password_hash'] },
      order: [['id', 'DESC']],
    });
  }

  async findOne(where: WhereOptions<User>): Promise<User | null> {
    const options: FindOptions = {
      where,
      attributes: { exclude: ['password_hash'] },
    };
    return User.findOne(options);
  }

  async findOneById(id: number): Promise<User> {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] },
    });
    if (!user) throw new NotFoundException('User không tồn tại');
    return user;
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    const user = await User.findByPk(id);
    if (!user) throw new NotFoundException('User không tồn tại');

    //Check unique nếu thay đổi email
    if (dto.email && dto.email !== user.email) {
      const existEmail = await User.findOne({
        where: { email: dto.email },
      });
      if (existEmail && existEmail.id !== id) {
        throw new ConflictException('Email đã tồn tại');
      }
    }

    // Check unique nếu thay đổi phone
    if (dto.phone_number && dto.phone_number !== user.phone_number) {
      const existPhone = await User.findOne({
        where: { phone_number: dto.phone_number },
      });
      if (existPhone && existPhone.id !== id) {
        throw new ConflictException('Số điện thoại đã tồn tại');
      }
    }

    // Chuẩn bị payload cập nhật
    const payload: Partial<User> = {
      full_name: dto.full_name ?? user.full_name,
      email: dto.email ?? user.email,
      phone_number: dto.phone_number ?? user.phone_number,
      avatar_url: dto.avatar_url ?? user.avatar_url,
    };

    //Nếu thay đổi password
    if (dto.password) {
      const salt = await bcrypt.genSalt(10);
      payload['password_hash'] = await bcrypt.hash(dto.password, salt);
    }

    await user.update(payload);

    //Delete password
    const plain = user.get({ plain: true });
    delete plain.password_hash;
    return plain;
  }

  async deleteUser(id: number): Promise<{ message: string }> {
    try {
      const affected = await User.destroy({ where: { id } });
      if (!affected) {
        throw new NotFoundException('User không tồn tại');
      }
      return { message: `Xoá user #${id} thành công` };
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
