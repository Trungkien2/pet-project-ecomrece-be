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
import { CountryService } from './country.service';
import { CreateCountryDto, UpdateCountryDto } from './country.dto';

@ApiTags('Countries')
@Controller('country')
export class CountryController extends CrudController<CountryService> {
  constructor(private readonly countryService: CountryService) {
    super(countryService);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new country' })
  @ApiResponse({ status: 201, description: 'Country created' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Iso2/Name already exists' })
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async create(@Body() dto: CreateCountryDto) {
    const country = await this.countryService.create(dto);
    return country;
  }

  @Get()
  async getAll() {
    return this.countryService.findAll();
  }

  @Get(':id(\\d+)')
  async getOneById(@Param('id', ParseIntPipe) id: number) {
    return this.countryService.findOneById(id);
  }

  @Get('find')
  async find(
    @Query('iso2') iso2?: string,
    @Query('name') name?: string,
    @Query('id') id?: string,
  ) {
    if (iso2) return this.countryService.findOne({ iso2 });
    if (name) return this.countryService.findOne({ name });
    if (id) return this.countryService.findOne({ id: Number(id) });
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
  async updateCountry(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCountryDto,
  ) {
    return this.countryService.updateCountry(id, dto);
  }

  @Delete(':id(\\d+)')
  @HttpCode(HttpStatus.OK)
  async deleteCountry(@Param('id', ParseIntPipe) id: number) {
    await this.countryService.deleteCountry(id);
  }
}
