import { Module } from '@nestjs/common';
import { Country } from './country.entity';
import { CountryService } from './country.service';
import { countriesProviders } from './country.providers';
import { CountryController } from './country.controller';

@Module({
  providers: [CountryService, Country, ...countriesProviders],
  controllers: [CountryController],
  exports: [CountryService],
})
export class CountryModule {}
