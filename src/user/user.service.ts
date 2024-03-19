import { Injectable, Inject } from '@nestjs/common';
import { User } from './user.entity';

import { CrudService } from 'src/core/Base/crud.service';
import { ModelCtor } from 'sequelize-typescript';
import { CreateOptions } from 'sequelize';
import { AuthException, DatabaseException } from 'src/core/exception';
import { EXCEPTION } from 'src/core/exception/exception';
import { LoginAuthDto } from 'src/auth/dto/login-auth.dto';

@Injectable()
export class UserService extends CrudService<User> {
  constructor() {
    super(User);
  }
  async registerUser(params: any) {
    try {
      const user = await User.findOne({
        where: {
          email: params?.email,
        },
      });

      if (user) {
        throw new AuthException(EXCEPTION.EMAIL_ALREADY_REGISTERED);
      } else {
        const t = await this.transaction();
        const newUser = await this.exec(
          User.create(params, { transaction: t, logging: true }),
        );
        await t.commit();

        return newUser;
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async loginUser(params: LoginAuthDto) {
    try {
      const user = await this._model.findOne({
        where: {
          email: params?.email,
        },
      });
      if (!user)
        throw new AuthException(EXCEPTION.EMAIL_OR_PASSWORD_IS_INCORRECT);
      if (params?.password !== user.password)
        throw new AuthException(EXCEPTION.EMAIL_OR_PASSWORD_IS_INCORRECT);

      return { user };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
