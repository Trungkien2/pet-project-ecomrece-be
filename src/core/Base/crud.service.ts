import { Injectable } from '@nestjs/common';
import { Model, ModelCtor } from 'sequelize-typescript';
import { QueryInfoDto } from '../interface/query-info.dto';
import {
  CreateOptions,
  DestroyOptions,
  Transaction,
  UpdateOptions,
} from 'sequelize';
import { EXCEPTION } from '../exception/exception';
import { DatabaseException, RouterException } from '../exception';
import { sequelize } from '../database/database.providers';
import _ from 'lodash';

export interface ICrudExecOption {
  allowNull?: boolean;
  errorCustom?: Error;
}

@Injectable()
export class CrudService<T extends Model<T>> {
  _model: ModelCtor<T>;
  constructor(private model: ModelCtor<T>) {
    this._model = model;
  }

  async getList(queryInfo?: QueryInfoDto) {
    return await this.exec(this.model.findAndCountAll<T>(queryInfo));
  }
  async getItem(queryInfo?: QueryInfoDto) {
    return await this.exec(this.model.findOne<T>(queryInfo), {
      allowNull: false,
    });
  }
  async create(params: any, option?: CreateOptions) {
    return await this.exec(this.model.create(params, option));
  }
  async update(params: any, option?: UpdateOptions | QueryInfoDto) {
    await this.exec(this.model.update(params, option), {
      allowNull: false,
    });

    return await this.exec(this.model.findAll(option), {
      allowNull: false,
    });
  }

  async bulkUpdate(
    params: {
      items: [];
      updateOnDuplicateBy: string[];
    },
    option: UpdateOptions | QueryInfoDto,
  ) {
    const { items, updateOnDuplicateBy } = params;
    let updateOnDuplicate = [];
    const updated_at = sequelize.fn('NOW');
    const updated_at_unix_timestamp = sequelize.literal('CURRENT_TIMESTAMP');
    items.forEach((item: any) => {
      item.updated_at = updated_at;
      item.updated_at_unix_timestamp = updated_at_unix_timestamp;
      updateOnDuplicate = [
        ...updateOnDuplicate,
        ...Object.getOwnPropertyNames(item),
      ];
    });
    const attributes = Object.getOwnPropertyNames(this.model.getAttributes());
    updateOnDuplicate = _.remove(updateOnDuplicate, (item: string) => {
      return !updateOnDuplicateBy.includes(item) && attributes.includes(item);
    });

    const result = await this.model.bulkCreate(items, {
      updateOnDuplicate,
    });
    option.where.id = { $in: result.map((item) => item.id) };

    return await this.exec(this.model.findAndCountAll<T>(option));
  }

  async delete(option?: DestroyOptions | QueryInfoDto) {
    const item = await this.exec(this.model.findOne(option), {
      allowNull: false,
    });
    return await item.destroy();
  }
  async deleteAll(option?: DestroyOptions) {
    const t = await this.transaction();
    option.transaction = t;
    try {
      const result = await this.exec(this.model.destroy(option), {
        allowNull: false,
      });
      await t.commit();
      return result;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  async transaction(): Promise<Transaction> {
    return await sequelize.transaction();
  }

  async exec(
    promise: any,
    option: ICrudExecOption = { allowNull: true },
  ): Promise<any> {
    try {
      const result = await promise;

      if ((result === undefined || result === null) && !option.allowNull)
        if (option.errorCustom) {
          throw option.errorCustom;
        } else {
          throw new DatabaseException(EXCEPTION.RECORD_NOT_FOUND);
        }

      return result;
    } catch (err) {
      throw new RouterException(EXCEPTION.SORRY_SOMETHING_WENT_WRONG);
    }
  }
}
