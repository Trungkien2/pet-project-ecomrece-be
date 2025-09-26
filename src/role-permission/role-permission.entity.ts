import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AllowNull,
  Default,
} from 'sequelize-typescript';

@Table({
  tableName: 'role_permission',
  timestamps: false,
})
export class RolePermission extends Model<RolePermission> {
  @PrimaryKey
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  permission_id!: number;

  @PrimaryKey
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  role_id!: number;

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
