import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
} from 'sequelize-typescript';
import { Role } from '../roles/roles.entity';
import { Permission } from '../permissions/permission.entity';

@Table({
  tableName: 'role_permission',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class RolePermission extends Model<RolePermission> {
  @PrimaryKey
  @ForeignKey(() => Permission)
  @Column({ type: DataType.BIGINT, allowNull: false })
  permission_id!: number;

  @PrimaryKey
  @ForeignKey(() => Role)
  @Column({ type: DataType.BIGINT, allowNull: false })
  role_id!: number;

  @CreatedAt
  @Column({ field: 'created_at', type: DataType.DATE })
  created_at!: Date;

  @UpdatedAt
  @Column({ field: 'updated_at', type: DataType.DATE })
  updated_at!: Date;
}
