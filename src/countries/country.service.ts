import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CrudService } from 'src/core/Base/crud.service';
import { Country } from './country.entity';
import { CreateCountryDto, UpdateCountryDto } from './country.dto';
import { FindOptions, WhereOptions } from 'sequelize';

@Injectable()
export class CountryService extends CrudService<Country> {
  constructor() {
    super(Country);
  }

  async create(dto: CreateCountryDto): Promise<Country> {
    if (!dto.iso2 || !dto.name) {
      throw new BadRequestException('Cần cung cấp mã và tên country!');
    }
    if (dto.iso2) {
      const existIso2 = await Country.findOne({ where: { iso2: dto.iso2 } });
      if (existIso2) {
        throw new ConflictException('Mã iso2 đã tồn tại');
      }
    }
    if (dto.name) {
      const existName = await Country.findOne({ where: { name: dto.name } });
      if (existName) {
        throw new ConflictException('Tên country đã tồn tại');
      }
    }

    const country = await Country.create({
      name: dto.name,
      iso2: dto.iso2,
    });
    return country;
  }

  async findAll(): Promise<Country[]> {
    return Country.findAll({
      order: [['id', 'DESC']],
    });
  }

  async findOne(where: WhereOptions<Country>): Promise<Country | null> {
    const options: FindOptions = {
      where,
    };
    return Country.findOne(options);
  }

  async findOneById(id: number): Promise<Country> {
    const country = await Country.findByPk(id);
    if (!country) throw new NotFoundException('Country không tồn tại');
    return country;
  }

  async updateCountry(id: number, dto: UpdateCountryDto) {
    const country = await Country.findByPk(id);
    if (!country) throw new NotFoundException('Country không tồn tại');

    //Check unique nếu thay đổi iso2
    if (dto.iso2 && dto.iso2 !== country.iso2) {
      const existIso2 = await Country.findOne({
        where: { iso2: dto.iso2 },
      });
      if (existIso2 && existIso2.id !== id) {
        throw new ConflictException('Iso2 đã tồn tại');
      }
    }

    // Check unique nếu thay đổi name
    if (dto.name && dto.name !== country.name) {
      const existName = await Country.findOne({
        where: { name: dto.name },
      });
      if (existName && existName.id !== id) {
        throw new ConflictException('Tên country đã tồn tại');
      }
    }

    // Chuẩn bị payload cập nhật
    const payload: Partial<Country> = {
      name: dto.name ?? country.name,
      iso2: dto.iso2 ?? country.iso2,
    };

    await country.update(payload);

    return country;
  }

  async deleteCountry(id: number): Promise<{ message: string }> {
    try {
      const affected = await Country.destroy({ where: { id } });
      if (!affected) {
        throw new NotFoundException('Country không tồn tại');
      }
      return { message: `Xoá country #${id} thành công` };
    } catch (err: any) {
      if (err?.name === 'SequelizeForeignKeyConstraintError') {
        throw new BadRequestException(
          'Không thể xoá do ràng buộc dữ liệu liên quan',
        );
      }
      throw err;
    }
  }
}
