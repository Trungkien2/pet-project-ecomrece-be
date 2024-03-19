import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Logger,
  Param,
  Post,
  Put,
  Query,
  Req,
  Request,
  Res,
} from '@nestjs/common';

import { ApiBearerAuth } from '@nestjs/swagger';

import { QueryInfoDto } from '../interface/query-info.dto';
import { CrudService, ICrudExecOption } from './crud.service';
import { Public } from '../decorator/public.decorator';
import { ApiQueryInfo, QueryInfo } from '../decorator/query-info.decorator';
import { PublicPrivate } from '../decorator/public-private.decorator';
import { Response, response } from 'express';
import { config } from 'dotenv';
import _ from 'lodash';

@ApiBearerAuth()
export class CrudController<T extends CrudService<any>> {
  private logger = new Logger(this.constructor.name);
  constructor(private service: T) {}

  @PublicPrivate()
  @Get()
  @ApiQueryInfo()
  async getAll(@QueryInfo() queryInfo: QueryInfoDto) {
    console.log(
      '🚀 ~ file: crud.controller.ts:40 ~ CrudController<T ~ queryInfo',
      queryInfo,
    );
    return await this.service.getList(queryInfo);
  }

  @Public()
  @ApiQueryInfo()
  @Get(':id')
  async getItem(@Param('id') id: string, @QueryInfo() queryInfo: QueryInfoDto) {
    queryInfo.where.id = id;
    return await this.service.getItem(queryInfo);
  }
  @ApiBearerAuth()
  @ApiQueryInfo()
  @Post()
  async create(@Body() body: any) {
    return await this.service.create(body);
  }

  @ApiBearerAuth()
  @ApiQueryInfo()
  @Put('')
  async updateAll(@Body() body: any, @QueryInfo() queryInfo: QueryInfoDto) {
    return await this.service.update(body, queryInfo);
  }

  @ApiBearerAuth()
  @ApiQueryInfo()
  @Put('bulk-update')
  async bulkUpdate(@Body() body: any, @QueryInfo() queryInfo: QueryInfoDto) {
    return await this.service.bulkUpdate(body, queryInfo);
  }

  @ApiBearerAuth()
  @ApiQueryInfo()
  @Put(':id')
  async updateItem(
    @Body() body: any,
    @Param('id') id: string,
    @QueryInfo() queryInfo: QueryInfoDto,
  ) {
    queryInfo.where.id = id;
    return await this.service.update(body, queryInfo);
  }

  @ApiBearerAuth()
  @ApiQueryInfo()
  @Delete()
  async deleteAll(@QueryInfo() queryInfo: QueryInfoDto) {
    return await this.service.deleteAll(queryInfo);
  }

  @ApiBearerAuth()
  @ApiQueryInfo()
  @Delete(':id')
  async deleteItem(
    @Param('id') id: string,
    @QueryInfo() queryInfo: QueryInfoDto,
  ) {
    queryInfo.where.id = id;
    return await this.service.delete(queryInfo);
  }

  async getModel() {
    return this.service._model;
  }
  onSuccess(object: any = {}, extras: any = {}) {
    object = object || {};
    if (Object.keys(object).length === 0) {
      response.json({
        code: 200,
      });
    } else {
      response.json({
        code: 200,
        results: Object.assign(
          {
            object,
          },
          extras,
        ),
      });
    }
  }
  onSuccessAsList(
    res: Response,
    objects: any = [],
    extras: any = {},
    option: {
      offset: 0;
      limit: 50;
    },
  ) {
    if (objects.toJSON) {
      objects = objects.toJSON();
    }
    const page = _.floor(option.offset / option.limit) + 1;
    res.json({
      code: 200,
      results: Object.assign(
        {
          objects,
        },
        extras,
      ),
      pagination: {
        current_page: page,
        next_page: page + 1,
        prev_page: page - 1,
        limit: option.limit,
      },
    });
  }
}
