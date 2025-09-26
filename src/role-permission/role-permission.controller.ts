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
import { RolePermissionService } from './role-permission.service';

import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  CreateRolePermissionDTO,
  DeleteRolePermissionDTO,
  FindRolePermissionQueryDTO,
} from './role-permission.dto';

@ApiTags('RolePermissions')
@Controller('role-permission')
export class RolePermissionController extends CrudController<RolePermissionService> {
  constructor(private readonly rolePermissionService: RolePermissionService) {
    super(rolePermissionService);
  }

  @Post()
  @ApiOperation({ summary: 'create permission role' })
  async create(@Body() dto: CreateRolePermissionDTO) {
    const rolePermission = await this.rolePermissionService.create(dto);
    return rolePermission;
  }

  @Get()
  @ApiOperation({ summary: 'find all permission role' })
  async getAll() {
    const rolePermissions = await this.rolePermissionService.findAll();
    return rolePermissions;
  }

  @Get('find')
  @ApiOperation({ summary: 'find permission role by primary key' })
  @ApiQuery({
    name: 'permission_id',
    required: true,
    type: Number,
    description: 'ID của permission',
  })
  @ApiQuery({
    name: 'role_id',
    required: true,
    type: Number,
    description: 'ID của role',
  })
  async getByPk(@Query() q: FindRolePermissionQueryDTO) {
    const rolePermission = await this.rolePermissionService.findByPk(q.permission_id, q.role_id);
    return rolePermission;
  }

  @Delete()
  @ApiOperation({ summary: 'Delete permission role' })
  async delete(@Body() dto: DeleteRolePermissionDTO) {
    const rolePermission = await this.rolePermissionService.deleteRolePermission(dto);
  }
}
