import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CrudController } from 'src/core/Base/crud.controller';
import { RoleService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './roles.dto';

@ApiTags('Roles')
@Controller('roles')
export class RoleController extends CrudController<RoleService> {
  constructor(private readonly roleService: RoleService) {
    super(roleService);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new role' })
  @ApiResponse({ status: 201, description: 'Role created' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Role already exists' })
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async create(@Body() dto: CreateRoleDto) {
    return this.roleService.create(dto);
  }

  @Get()
  async getAll() {
    return this.roleService.findAll(); // sẽ ẩn password_hash
  }

  @Get(':id(\\d+)')
  async getOneById(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.findOneById(id);
  }

  @Get('find')
  async find(@Query('name') name?: string) {
    if (name) return this.roleService.findOne({ name });
    // Không truyền gì → trả null cho thống nhất
    return null;
  }

  @Patch(':id(\\d+)')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.roleService.updateRole(id, dto);
  }

    @Delete(':id(\\d+)')
  @HttpCode(HttpStatus.OK)
  async deleteRole(@Param('id', ParseIntPipe) id: number) {
    await this.roleService.deleteRole(id);
  }
}
