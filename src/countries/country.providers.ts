import { Country } from './country.entity';
import { COUNTRY_REPOSITORY } from 'src/core/contants';
export const countriesProviders = [
  {
    provide: COUNTRY_REPOSITORY,
    useValue: Country,
  },
];
