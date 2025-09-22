import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Unique,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({
  tableName: 'permission',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
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
  @Unique('uk_permission_name')
  @Column({
    type: DataType.STRING(100),
  })
  name: string;

  @AllowNull(true)
  @Column({
    type: DataType.TEXT,
  })
  description?: string;

  @CreatedAt
  @Column({ field: 'created_at', type: DataType.DATE })
  created_at!: Date;

  @UpdatedAt
  @Column({ field: 'updated_at', type: DataType.DATE })
  updated_at!: Date;
}
