import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  Default,
  AllowNull,
} from 'sequelize-typescript';
import { User } from './user.entity';

@Table({
  tableName: 'tbl_user_follow',
})
export class UserFollow extends Model<UserFollow> {
  @PrimaryKey
  @AllowNull
  @Default(DataType.UUIDV1)
  @Column({
    type: DataType.UUID,
  })
  id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  follower_id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  following_id: string;

  @Column({
    type: DataType.BIGINT,
    defaultValue: 0,
  })
  created_at_unix_timestamp: number;

  @Column({
    type: DataType.BIGINT,
    defaultValue: 0,
  })
  updated_at_unix_timestamp: number;

  @CreatedAt
  CreatedAt: Date;

  @UpdatedAt
  UpdatedAt: Date;
}