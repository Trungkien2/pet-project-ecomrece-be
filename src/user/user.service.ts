import { Injectable } from '@nestjs/common';
import { User } from './user.entity';

import { CrudService } from 'src/core/Base/crud.service';

@Injectable()
export class UserService extends CrudService<User> {
  constructor() {
    super(User);
  }
}
