import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  Type,
} from '@nestjs/common';
import { ApiProperty, ApiQuery } from '@nestjs/swagger';
export const QueryInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return request.queryInfo ?? request.raw['queryInfo'];
  },
);

export class QueryDto {
  @ApiProperty({
    name: 'fields',
    default: '["$all"]',
    nullable: true,
    required: false,
  })
  fields: string;

  @ApiProperty({
    name: 'where',
    default: '{}',

    required: false,
  })
  where: string;

  @ApiProperty({
    name: 'limit',
    default: 'unlimited',
    nullable: true,
    required: false,
  })
  limit: string;

  @ApiProperty({
    name: 'page',
    default: 1,
    required: false,
  })
  page: number;

  @ApiProperty({
    name: 'order',
    default: '[["created_at","DESC"]]',
    required: false,
  })
  order: string;
}

export const ApiQueryInfo = () =>
  applyDecorators(
    ApiQuery({
      type: QueryDto,
    }),
  );
