# Database Rules - Sequelize & MySQL

## Schema Design

1. **Naming Conventions**:
   - Models/Entities: PascalCase (User, Order, Product)
   - Fields: camelCase trong code, snake_case trong DB
   - Tables: snake_case với `tableName` option trong `@Table`

2. **Relationships**:
   - One-to-Many: `@HasMany` và `@BelongsTo`
   - Many-to-Many: Explicit join table với `@BelongsToMany`
   - Optional relations: `?` cho nullable foreign keys

3. **Data Types**:
   - Money: `DataType.DECIMAL(10, 2)` hoặc `DataType.DECIMAL(12, 2)`
   - Dates: `DataType.DATE` với `@Default(DataType.NOW)`
   - JSON: `DataType.JSON` cho flexible data (images array, metadata)
   - Strings: `DataType.STRING(255)` hoặc specific length

## Critical Patterns

### 1. Timestamps
```typescript
@Table({ tableName: 'user', timestamps: false })
export class User extends Model<User> {
  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  created_at!: Date;
  
  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  updated_at!: Date;
}
```
- Sử dụng `timestamps: false` và define manually để control naming
- Unix timestamps trong hooks: `created_at_unix_timestamp`, `updated_at_unix_timestamp`

### 2. Price Snapshot (OrderItem)
```typescript
@Column({ type: DataType.DECIMAL(10, 2) })
unit_price!: number;  // Snapshot tại thời điểm đặt
```
- Lưu giá tại thời điểm order, không phải current price
- Đảm bảo tính nhất quán khi giá product thay đổi

### 3. Status Enums
- OrderStatus: PENDING → PROCESSING → SHIPPED → DELIVERED → COMPLETED → CANCELLED
- PaymentStatus: PENDING → PAID → FAILED → REFUNDED
- ProductStatus: PUBLISHED → DRAFT → ARCHIVED

### 4. Soft Delete
```typescript
@Column({ type: DataType.DATE })
deleted_at_unix_timestamp?: number;
```
- Sử dụng `deleted_at_unix_timestamp` thay vì hard delete
- Set trong `beforeDestroy` hook

## Migration Strategy

1. **Development**:
   ```bash
   # Sử dụng Sequelize CLI hoặc custom migration scripts
   npm run migrate
   ```

2. **Production**:
   ```bash
   npm run migrate:prod
   ```

3. **Never**:
   - Edit migration files sau khi đã chạy
   - Drop columns với data (dùng soft delete)
   - Change enum values trực tiếp (tạo migration mới)

## Query Best Practices

1. **Select only needed fields**:
   ```typescript
   User.findAll({
     attributes: ['id', 'full_name', 'email'],
     attributes: { exclude: ['password_hash'] }
   })
   ```

2. **Use includes wisely**:
   ```typescript
   Order.findByPk(id, {
     include: [
       { model: OrderItem, include: [Product] },
       { model: User }
     ]
   })
   ```

3. **Transactions for critical operations**:
   ```typescript
   const t = await this.transaction();
   try {
     await Order.create({ ... }, { transaction: t });
     await OrderItem.bulkCreate([...], { transaction: t });
     await t.commit();
   } catch (error) {
     await t.rollback();
     throw error;
   }
   ```

4. **Convert to plain object**:
   ```typescript
   const user = await User.findByPk(id);
   const plain = user.get({ plain: true });
   ```

## Indexing

- Foreign keys: Automatic indexes
- Unique fields: `@Unique` decorator
- Search fields: `@Index` decorator cho name, email, slug
- Composite indexes: Define trong migration khi query multiple fields thường xuyên
