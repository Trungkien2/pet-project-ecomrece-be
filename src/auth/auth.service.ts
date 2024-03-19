import { Injectable, Inject } from '@nestjs/common';

import { CrudService } from 'src/core/Base/crud.service';
import { User } from 'src/user/user.entity';

@Injectable()
export class AuthService extends CrudService<User> {
  constructor() {
    super(User);
  }
}
