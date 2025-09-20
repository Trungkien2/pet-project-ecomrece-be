import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Unique,
  Default,
  Index,
} from 'sequelize-typescript';

@Table({
  tableName: 'user',
  timestamps: false,
})
export class User extends Model<User> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  id!: number;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(255),
  })
  full_name?: string;

  @AllowNull(true)
  @Unique
  @Index('idx_user_email')
  @Column({
    type: DataType.STRING(255),
  })
  email?: string;

  @AllowNull(true)
  @Unique
  @Column({
    type: DataType.STRING(20),
  })
  phone_number?: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(255),
  })
  password_hash!: string;

  @AllowNull(true)
  @Column({
    type: DataType.DATE,
  })
  email_verified_at?: Date;

  @AllowNull(true)
  @Column({
    type: DataType.DATE,
  })
  phone_verified_at?: Date;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(255),
  })
  avatar_url?: string;

  @AllowNull(false)
  @Default(DataType.NOW)
  @Column({
    type: DataType.DATE,
  })
  created_at!: Date;

  @AllowNull(false)
  @Default(DataType.NOW)
  @Column({
    type: DataType.DATE,
  })
  updated_at!: Date;
}
