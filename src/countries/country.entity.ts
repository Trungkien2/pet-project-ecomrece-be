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
  BeforeValidate,
  BeforeUpdate,
  Index
} from 'sequelize-typescript';

@Table({
  tableName: 'countries',
  timestamps: false,
})
export class Country extends Model<Country> {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column({
    type: DataType.SMALLINT,
    allowNull: false,
  })
  id!: number;

  @AllowNull(false)
  @Index('idx_countries_iso2')
  @Unique('uq_countries_iso2')
  @Column({
    type: DataType.CHAR(2),
  })
  iso2!: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(100),
  })
  name!: string;

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

  @BeforeValidate
  static normalize(instance: Country) {
    if (typeof instance.iso2 === 'string') {
      instance.iso2 = instance.iso2.trim().toUpperCase();
    }
    if (typeof instance.name === 'string') {
      instance.name = instance.name.trim();
    }
  }

  @BeforeUpdate
  static touchUpdateAt(instance: Country) {
    instance.updated_at = new Date();
  }
}
