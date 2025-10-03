import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { CreateUserDTO, UpdateUserDTO } from './user.dto';
import { CrudService } from 'src/core/Base/crud.service';
import { AuthException } from 'src/core/exception';
import { EXCEPTION } from 'src/core/exception/exception';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService extends CrudService<User> {
  constructor() {
    super(User);
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  async create(dto: CreateUserDTO): Promise<User> {
    const t = await this.transaction();
    try {
      const emailExist = await User.findOne({ where: { email: dto.email } });
      if (emailExist) {
        throw new AuthException(EXCEPTION.EMAIL_ALREADY_REGISTERED);
      }
      const phoneExist = await User.findOne({
        where: { phone_number: dto.phone_number },
      });
      if (phoneExist) {
        throw new AuthException(EXCEPTION.PHONE_ALREADY_REGISTERED);
      }
      if (dto.password) {
        dto.password = await this.hashPassword(dto.password);
      }
      const newUser = await User.create(
        {
          full_name: dto.full_name,
          password_hash: dto.password,
          email: dto.email,
          phone_number: dto.phone_number,
          avatar_url: dto.avatar_url,
        },
        { transaction: t, logging: true },
      );

      await t.commit();
      const plain = newUser.get({ plain: true }) as any;
      delete plain.password_hash;
      return plain;
    } catch (error) {
      await t.rollback();
      console.log('Error in create user: ', error);
      throw error;
    }
  }

  async findByPk(id: number): Promise<User | null> {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new AuthException(EXCEPTION.USER_NOT_FOUND);
      }
      return user;
    } catch (error) {
      console.log('Error in findByPk: ', error);
      throw error;
    }
  }

  async findAll(): Promise<User[] | null> {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password_hash'] },
      });
      return users;
    } catch (error) {
      console.log('Error in findAll: ', error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<any> {
    const t = await this.transaction();
    try {
      const user = await User.destroy({ where: { id }, transaction: t });
      if (user === 0) {
        throw new AuthException(EXCEPTION.USER_NOT_FOUND);
      }
      await t.commit();
      return user;
    } catch (error) {
      console.log('Error in delete user: ', error);
      throw error;
    }
  }

  async updateUser(id: number, dto: UpdateUserDTO): Promise<User> {
    const t = await this.transaction();
    try {
      const user = await User.findByPk(id, { transaction: t });
      if (!user) {
        throw new AuthException(EXCEPTION.USER_NOT_FOUND); // 404
      }
      if (dto.email) {
        const emailExist = await User.findOne({
          where: { email: dto.email },
          transaction: t,
        });
        if (emailExist) {
          throw new AuthException(EXCEPTION.EMAIL_ALREADY_REGISTERED);
        }
      }
      if (dto.phone_number) {
        const phoneExist = await User.findOne({
          where: { phone_number: dto.phone_number },
          transaction: t,
        });
        if (phoneExist) {
          throw new AuthException(EXCEPTION.PHONE_ALREADY_REGISTERED);
        }
      }
      if (dto.password) {
        dto.password = await this.hashPassword(dto.password);
      }
      await user.update(dto, { transaction: t });

      await t.commit();

      const plain = user.get({ plain: true }) as any;
      delete plain.password_hash;
      return plain;
    } catch (error) {
      await t.rollback();
      console.log('Error in create user: ', error);
      throw error;
    }
  }
}
