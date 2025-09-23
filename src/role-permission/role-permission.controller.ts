import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolePermissionService } from './role-permission.service';
import {
  AddPermissionRoleDto,
  SetPermissionsForRoleDto,
} from './role-permission.dto';

@ApiTags('Role-Permissions')
@Controller('role-permissions')
export class RolePermissionController {
  constructor(private readonly service: RolePermissionService) {}

  // GET /role-permissions?roleId=123
  @Get()
  @ApiOperation({ summary: 'Danh sách permissions của 1 role' })
  async list(@Query('roleId', ParseIntPipe) roleId: number) {
    return this.service.listByRole(roleId);
  }

  // POST /role-permissions { roleId, permissionId }
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Gán 1 permission cho role' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async add(@Body() body: { roleId: number } & AddPermissionRoleDto) {
    return this.service.add(body.roleId, body.permissionId);
  }

  // PUT /role-permissions { roleId, permissionIds: number[] }
  @Put()
  @ApiOperation({ summary: 'Ghi đè danh sách permissions cho role' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async set(
    @Body()
    body: { roleId: number } & SetPermissionsForRoleDto,
  ) {
    return this.service.set(body.roleId, body.permissionIds);
  }

  // DELETE /role-permissions?roleId=123&permissionId=45
  @Delete()
  @ApiOperation({ summary: 'Huỷ gán 1 permission khỏi role' })
  async remove(
    @Query('roleId', ParseIntPipe) roleId: number,
    @Query('permissionId', ParseIntPipe) permissionId: number,
  ) {
    return this.service.remove(roleId, permissionId);
  }
}
