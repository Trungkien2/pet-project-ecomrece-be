import { Controller } from '@nestjs/common';
import { CrudController } from 'src/core/Base/crud.controller';
import { UserService } from './user.service';

import { ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('user')
export class UserController extends CrudController<UserService> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }
}
