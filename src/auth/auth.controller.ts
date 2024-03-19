import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CrudController } from 'src/core/Base/crud.controller';
import { UserService } from 'src/user/user.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { HttpResponse } from 'src/core/respone/http-respone';
import { LoginAuthDto } from './dto/login-auth.dto';

@Controller('auth')
export class AuthController extends CrudController<UserService> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }
  @Post('register')
  registerUser(@Body() body: CreateAuthDto) {
    const res = this.userService.registerUser(body);

    return res;
  }
  @Post('login')
  @HttpCode(HttpStatus.OK)
  loginUser(@Body() body: LoginAuthDto) {
    const res = this.userService.loginUser(body);

    return res;
  }
}
