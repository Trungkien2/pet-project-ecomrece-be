import { Allow, IsOptional, IsString } from 'class-validator';
import { AllowNull } from 'sequelize-typescript';

export class QueryInfoDto {
  // @IsOptional()
  // filter: {} | any;

  @IsOptional()
  query: any;

  @IsOptional()
  where: object | any;

  @IsOptional()
  limit: number;

  @IsOptional()
  page: number;

  @IsOptional()
  offset: number;

  @IsOptional()
  order: any[];

  @IsOptional()
  attributes: any;

  @IsOptional()
  include: any[];

  @IsOptional()
  distinct: boolean;

  @IsOptional()
  paranoid?: boolean;

  @IsOptional()
  transaction?: any;

  [key: string]: any;
}
