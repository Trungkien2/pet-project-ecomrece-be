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
  BelongsToMany,
} from 'sequelize-typescript';

export enum AccountType {
  IN_APP = 'IN_APP',
  GOOGLE = 'GOOGLE',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

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
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  user_name: string;

  @Column({
    type: DataType.ENUM(...Object.values(AccountType)),
    allowNull: false,
    defaultValue: AccountType.IN_APP,
  })
  account_type: AccountType;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  picture: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  bio: string;

  @Column({
    type: DataType.ENUM(...Object.values(Gender)),
    allowNull: true,
  })
  gender: Gender;

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
