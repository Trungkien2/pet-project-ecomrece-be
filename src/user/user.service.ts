import { Injectable, Inject } from '@nestjs/common';
import { User } from './user.entity';

import { CrudService } from 'src/core/Base/crud.service';
import { ModelCtor } from 'sequelize-typescript';

@Injectable()
export class UserService extends CrudService<User> {
  constructor() {
    super(User);
  }
}
