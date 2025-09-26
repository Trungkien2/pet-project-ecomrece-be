import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CrudController } from 'src/core/Base/crud.controller';
import { UserRoleService } from './user-role.service';

import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  CreateUserRoleDTO,
  DeleteUserRoleDTO,
  FindUserRoleQueryDTO,
} from './user-role.dto';

@ApiTags('UserRoles')
@Controller('user-role')
export class UserRoleController extends CrudController<UserRoleService> {
  constructor(private readonly userRoleService: UserRoleService) {
    super(userRoleService);
  }

  @Post()
  @ApiOperation({ summary: 'create user role' })
  async create(@Body() dto: CreateUserRoleDTO) {
    const userRole = await this.userRoleService.create(dto);
    return userRole;
  }

  @Get('find')
  @ApiOperation({ summary: 'find user role by primary key' })
  @ApiQuery({
    name: 'user_id',
    required: true,
    type: Number,
    description: 'ID của user',
  })
  @ApiQuery({
    name: 'role_id',
    required: true,
    type: Number,
    description: 'ID của role',
  })
  async getByPk(@Query() q: FindUserRoleQueryDTO) {
    const userRole = await this.userRoleService.findByPk(q.user_id, q.role_id);
    return userRole;
  }

  @Get()
  @ApiOperation({ summary: 'find all user role' })
  async getAll() {
    const userRoles = await this.userRoleService.findAll();
    return userRoles;
  }

  @Delete()
  @ApiOperation({ summary: 'Delete user role' })
  async delete(@Body() dto: DeleteUserRoleDTO) {
    const userRole = await this.userRoleService.deleteUserRole(dto);
  }
}
