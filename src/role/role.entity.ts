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
  tableName: 'role',
  timestamps: false,
})
export class Role extends Model<Role> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  id!: number;

  @AllowNull(false)
  @Index('idx_role_name')
  @Unique
  @Column({
    type: DataType.STRING(100),
  })
  name!: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(255),
  })
  description?: string;

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
