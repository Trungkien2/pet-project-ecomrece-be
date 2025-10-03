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
import { PermissionService } from './permission.service';

import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreatePermissionDTO, UpdatePermissionDTO } from './permission.dto';

@ApiTags('Permissions')
@Controller('permission')
export class PermissionController extends CrudController<PermissionService> {
  constructor(private readonly permissionService: PermissionService) {
    super(permissionService);
  }

  @Post()
  @ApiOperation({ summary: 'create permission' })
  async create(@Body() dto: CreatePermissionDTO) {
    const permission = await this.permissionService.create(dto);
    return permission;
  }

  @Get(':id')
  @ApiOperation({ summary: 'find permission by primary key' })
  async getByPk(@Param('id', ParseIntPipe) id: number) {
    const permission = await this.permissionService.findByPk(id);
    return permission;
  }

  @Get()
  @ApiOperation({ summary: 'find all permissions' })
  async getAll() {
    const permissions = await this.permissionService.findAll();
    if (!permissions) {
      return {
        success: false,
        message: 'Permission not found',
      };
    } else {
      return permissions;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete permission' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    const permission = await this.permissionService.deletePermission(id);
    return {
      success: true,
      message: 'Delete permission success!',
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update permission' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePermissionDTO,
  ) {
    const permission = await this.permissionService.updatePermission(id, dto);
    return permission;
  }
}
