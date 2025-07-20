import { Injectable } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { sequelize } from '../database/database.providers';

@Injectable()
export class TransactionManager {
  async transaction(): Promise<Transaction> {
    return await sequelize.transaction();
  }

  async executeInTransaction<T>(callback: (transaction: Transaction) => Promise<T>): Promise<T> {
    const transaction = await this.transaction();
    try {
      const result = await callback(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}