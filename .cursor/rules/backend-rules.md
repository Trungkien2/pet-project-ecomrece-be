# Backend Rules - NestJS Server

## Cấu trúc Module

```
src/
├── auth/             # Authentication module
├── user/             # User management
├── role/             # Role management
├── permission/       # Permission management
├── core/             # Shared utilities, guards, decorators
│   ├── Base/         # Base CRUD classes
│   ├── database/     # Database config & providers
│   ├── exception/    # Custom exceptions
│   ├── guards/       # Auth guards
│   └── middlewares/  # Custom middlewares
└── documents/        # TDD documents
```

## Quy tắc NestJS

1. **Module Pattern**:
   - Mỗi feature = 1 module (auth, user, role, permission, etc.)
   - Module exports: Controllers, Services, DTOs, Entities
   - Shared logic → `src/core/`

2. **Dependency Injection**:
   - Luôn inject dependencies qua constructor
   - Sử dụng `@Injectable()` cho services
   - Tránh circular dependencies

3. **Error Handling**:
   - Sử dụng NestJS Exception Filters
   - Custom exceptions trong `src/core/exception/`
   - Format: `throw new AuthException(EXCEPTION.USER_NOT_FOUND)`

4. **Validation**:
   - DTOs với `class-validator` decorators
   - Global validation pipe trong `main.ts`

## Sequelize Best Practices

1. **Entity Pattern**:
   ```typescript
   @Table({ tableName: 'user', timestamps: false })
   export class User extends Model<User> {
     @PrimaryKey
     @AutoIncrement
     @Column({ type: DataType.BIGINT })
     id!: number;
   }
   ```

2. **Service Pattern**:
   ```typescript
   @Injectable()
   export class UserService extends CrudService<User> {
     constructor() {
       super(User);
     }
     
     async findOne(id: number) {
       return User.findByPk(id);
     }
   }
   ```

3. **Transactions**:
   - Sử dụng `this.transaction()` từ CrudService
   - Hoặc `sequelize.transaction()` cho complex operations
   - Đặc biệt quan trọng cho order flow

4. **Migrations**:
   - Chạy `npm run migrate` hoặc Sequelize CLI
   - Migration files trong `migrations/` folder
   - Không edit migration files trực tiếp sau khi đã chạy

5. **Query Patterns**:
   - Sử dụng `User.findAll()`, `User.findByPk()`, `User.findOne()`
   - Sử dụng `attributes: { exclude: ['password_hash'] }` để hide sensitive data
   - Sử dụng `get({ plain: true })` để convert to plain object

## API Design

- RESTful conventions
- Versioning: `/api/v1/...` (nếu cần)
- Response format: Consistent structure với error handling
- Pagination: Sử dụng offset-based với limit/offset
