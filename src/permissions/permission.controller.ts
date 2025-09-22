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
import { PermissionService } from './permission.service';
import { CreatePermissionDto, UpdatePermissionDto } from './permission.dto';

@ApiTags('permission')
@Controller('permission')
export class PermissionController extends CrudController<PermissionService> {
  constructor(private readonly permissionService: PermissionService) {
    super(permissionService);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new Permission' })
  @ApiResponse({ status: 201, description: 'Permission created' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Permission already exists' })
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async create(@Body() dto: CreatePermissionDto) {
    return this.permissionService.create(dto);
  }

  @Get()
  async getAll() {
    return this.permissionService.findAll();
  }

  @Get(':id(\\d+)')
  async getOneById(@Param('id', ParseIntPipe) id: number) {
    return this.permissionService.findOneById(id);
  }

  @Get('find')
  async find(@Query('name') name?: string) {
    if (name) return this.permissionService.findOne({ name });
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
  async updatePermission(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePermissionDto,
  ) {
    return this.permissionService.updatePermission(id, dto);
  }

    @Delete(':id(\\d+)')
  @HttpCode(HttpStatus.OK)
  async deletePermission(@Param('id', ParseIntPipe) id: number) {
    await this.permissionService.deletePermission(id);
  }
}
