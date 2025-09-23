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
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@ApiTags('Users')
@Controller('user')
export class UserController extends CrudController<UserService> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }

  // [ADDED] POST /api/v1/user
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, description: 'User created' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Email/Phone already exists' })
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async create(@Body() dto: CreateUserDto) {
    const user = await this.userService.create(dto);
    // (tùy chọn) ẩn password_hash trước khi trả về:
    const { password_hash, ...safe } = user.get({ plain: true });
    return safe;
  }

  @Get()
  async getAll() {
    return this.userService.findAll(); // sẽ ẩn password_hash
  }

  @Get(':id(\\d+)')
  async getOneById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOneById(id);
  }

  @Get('find')
  async find(
    @Query('email') email?: string,
    @Query('phone_number') phone?: string,
    @Query('id') id?: string,
  ) {
    if (email) return this.userService.findOne({ email });
    if (phone) return this.userService.findOne({ phone_number: phone });
    if (id) return this.userService.findOne({ id: Number(id) });
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
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, dto);
  }

  @Delete(':id(\\d+)')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    await this.userService.deleteUser(id);
  }
}
