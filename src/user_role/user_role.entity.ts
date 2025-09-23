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
import { User } from '../users/user.entity';
import { Role } from '../roles/roles.entity';

@Table({
  tableName: 'user_roles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class UserRole extends Model<UserRole> {
  @PrimaryKey
  @ForeignKey(() => User)
  @Column({ type: DataType.BIGINT, allowNull: false })
  user_id!: number;

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
