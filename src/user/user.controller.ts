import {
  Body,
  Controller,
  Post,
  ValidationPipe,
  UsePipes,
  Query,
  Param,
  ParseIntPipe,
  Get,
  Delete,
  Patch,
} from '@nestjs/common';
import { CrudController } from 'src/core/Base/crud.controller';
import { UserService } from './user.service';

import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateUserDTO, UpdateUserDTO } from './user.dto';

@ApiTags('Users')
@Controller('user')
export class UserController extends CrudController<UserService> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }

  @Post()
  @ApiOperation({ summary: 'create user' })
  async create(@Body() dto: CreateUserDTO) {
    const user = await this.userService.create(dto);
    return user;
  }

  @Get(':id')
  @ApiOperation({ summary: 'find user by primary key' })
  async getByPk(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findByPk(id);
    if (user) {
      const plain = user.get({ plain: true }) as any;
      delete plain.password_hash;
      return plain;
    }
  }

  @Get()
  @ApiOperation({ summary: 'find all users' })
  async getAll() {
    const users = await this.userService.findAll();
    return users
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    const user = this.userService.deleteUser(id);
    return {
      success: true,
      message: 'Delete user success!',
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDTO,
  ) {
    const user = await this.userService.updateUser(id, dto);
    return user;
  }
}
