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
  tableName: 'permission',
  timestamps: false,
})
export class Permission extends Model<Permission> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  id!: number;

  @AllowNull(false)
  @Index('idx_permission_name')
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
