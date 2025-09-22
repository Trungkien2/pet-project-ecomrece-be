import {
  Controller, Get, Post, Delete, Put, Param, Body,
  ParseIntPipe, UsePipes, ValidationPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserRoleService } from './user_role.service';
import { AddUserRoleDto, AssignRolesDto } from './user_role.dto';

@ApiTags('UserRoles')
@Controller('user-roles')
export class UserRoleController {
  constructor(private readonly userRoleService: UserRoleService) {}

  @Get('users/:userId')
  @ApiOperation({ summary: 'Lấy danh sách roles của user' })
  async getRolesByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.userRoleService.getRolesByUser(userId);
  }

  @Get('roles/:roleId/users')
  @ApiOperation({ summary: 'Lấy danh sách users theo role' })
  async getUsersByRole(@Param('roleId', ParseIntPipe) roleId: number) {
    return this.userRoleService.getUsersByRole(roleId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Gán 1 role cho 1 user' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async add(@Body() dto: AddUserRoleDto) {
    return this.userRoleService.add(dto);
  }

  @Delete(':userId/:roleId')
  @ApiOperation({ summary: 'Huỷ gán 1 role khỏi 1 user' })
  async remove(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.userRoleService.remove(userId, roleId);
  }

  @Put('users/:userId')
  @ApiOperation({ summary: 'Gán lại (overwrite) toàn bộ roles cho user' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async set(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: AssignRolesDto,
  ) {
    return this.userRoleService.set(userId, dto);
  }
}
