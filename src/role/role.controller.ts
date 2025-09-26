import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CrudController } from 'src/core/Base/crud.controller';
import { RoleService } from './role.service';

import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateRoleDTO, UpdateRoleDTO } from './role.dto';

@ApiTags('Roles')
@Controller('role')
export class RoleController extends CrudController<RoleService> {
  constructor(private readonly roleService: RoleService) {
    super(roleService);
  }

  @Post()
  @ApiOperation({ summary: 'create role' })
  async create(@Body() dto: CreateRoleDTO) {
    const role = await this.roleService.create(dto);
    return role;
  }

  @Get(':id')
  @ApiOperation({ summary: 'find role by primary key' })
  async getByPk(@Param('id', ParseIntPipe) id: number) {
    const role = await this.roleService.findByPk(id);
    return role;
  }

  @Get()
  @ApiOperation({ summary: 'find all roles' })
  async getAll() {
    const roles = await this.roleService.findAll();
    if (!roles) {
      return {
        success: false,
        message: 'Role not found',
      };
    } else {
      return roles;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    const role = await this.roleService.deleteRole(id);
    return {
      success: true,
      message: 'Delete role success!',
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update role' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDTO,
  ) {
    const role = await this.roleService.updateRole(id, dto);
    return role;
  }
}
