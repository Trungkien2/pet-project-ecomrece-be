import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { CrudController } from 'src/core/Base/crud.controller';

@Controller('user')
export class UserController extends CrudController<UserService> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }
}
