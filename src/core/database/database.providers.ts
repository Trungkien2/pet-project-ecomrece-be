import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import { SEQUELIZE, DEVELOPMENT, TEST, PRODUCTION } from '../contants';
import { databaseConfig } from './database.config';
import * as entity from 'src/core/database/entity';
import { Op } from 'sequelize';

const operatorsAliases = {
  $eq: Op.eq,
  $ne: Op.ne,
  $gte: Op.gte,
  $gt: Op.gt,
  $lte: Op.lte,
  $lt: Op.lt,
  $not: Op.not,
  $in: Op.in,
  $notIn: Op.notIn,
  $is: Op.is,
  $like: Op.like,
  $notLike: Op.notLike,
  $iLike: Op.iLike,
  $notILike: Op.notILike,
  $regexp: Op.regexp,
  $notRegexp: Op.notRegexp,
  $iRegexp: Op.iRegexp,
  $notIRegexp: Op.notIRegexp,
  $between: Op.between,
  $notBetween: Op.notBetween,
  $overlap: Op.overlap,
  $contains: Op.contains,
  $contained: Op.contained,
  $adjacent: Op.adjacent,
  $strictLeft: Op.strictLeft,
  $strictRight: Op.strictRight,
  $noExtendRight: Op.noExtendRight,
  $noExtendLeft: Op.noExtendLeft,
  $and: Op.and,
  $or: Op.or,
  $any: Op.any,
  $all: Op.all,
  $values: Op.values /** Missing typings **/,
  $col: Op.col,
};
const entities = [];
for (const elementEntity of Object.values(entity)) {
  entities.push({
    provide: elementEntity,
    useValue: elementEntity,
  });
}

let config;
switch (process.env.NODE_ENV) {
  case DEVELOPMENT:
    config = databaseConfig.development;
    break;
  case TEST:
    config = databaseConfig.test;
    break;
  case PRODUCTION:
    config = databaseConfig.production;
    break;
  default:
    config = databaseConfig.development;
}
const sequelize = new Sequelize({
  ...config,

  models: [...Object.values(entity)],
  hooks: {
    beforeCreate: (item: any) => {
      const date = new Date();
      item.created_at_unix_timestamp = date.valueOf();
      item.updated_at_unix_timestamp = date.valueOf();
    },
    beforeBulkCreate(items: any[], options: SequelizeOptions) {
      const date = new Date();
      const isBulkUpdate = !!options['updateOnDuplicate'];
      for (const item of items) {
        if (!isBulkUpdate) {
          item.created_at_unix_timestamp = date.valueOf();
        }
        item.updated_at_unix_timestamp = date.valueOf();
      }
    },
    beforeUpdate: (item: any) => {
      item.updated_at_unix_timestamp = new Date().valueOf();
    },
    beforeDestroy: (item: any) => {
      item.deleted_at_unix_timestamp = new Date().valueOf();
    },
  },
  operatorsAliases,
});

const databaseProviders = [
  {
    provide: SEQUELIZE,
    useFactory: async () => {
      // nếu sử dụng sync thì không cần phải miragiton
      return sequelize.sync({ alter: true });
    },
  },
];

export { databaseProviders, operatorsAliases, entities, sequelize };
