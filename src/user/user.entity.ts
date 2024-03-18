import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  AllowNull,
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({
  tableName: 'tbl_user',
})
export class User extends Model<User> {
  @PrimaryKey
  @AllowNull
  @Default(DataType.UUIDV1)
  @Column({
    type: DataType.UUID,
  })
  id: string;
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;
  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: '',
  })
  email: string;

  @Column({
    field: 'username',
    type: DataType.STRING,
    allowNull: false,
  })
  username: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

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

  @Column({
    type: DataType.DATE,
  })
  deleted_at: string;

  @CreatedAt
  CreatedAt: Date;

  @UpdatedAt
  UpdatedAt: Date;
}
