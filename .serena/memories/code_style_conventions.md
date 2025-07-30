# Code Style and Conventions

## TypeScript & NestJS Conventions

### Class and Interface Naming
- **Classes**: PascalCase (e.g., `UserService`, `AuthController`)
- **Interfaces**: PascalCase with 'I' prefix (e.g., `IDatabaseConfig`, `IException`)
- **Enums**: PascalCase (e.g., `AccountType`, `Gender`)
- **DTOs**: PascalCase with 'Dto' suffix (e.g., `LoginAuthDto`, `CreateAuthDto`)

### Method and Variable Naming
- **Methods**: camelCase (e.g., `registerUser`, `hashPassword`)
- **Variables**: camelCase (e.g., `userId`, `saltRounds`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `USER_REPOSITORY`, `JWT_SECRET`)

### File Naming
- **Controllers**: kebab-case with `.controller.ts` suffix
- **Services**: kebab-case with `.service.ts` suffix  
- **Modules**: kebab-case with `.module.ts` suffix
- **DTOs**: kebab-case with `.dto.ts` suffix
- **Entities**: kebab-case with `.entity.ts` suffix
- **Interfaces**: kebab-case with `.interface.ts` suffix

### Code Organization

#### Module Structure
```
module-name/
  ├── module-name.controller.ts
  ├── module-name.service.ts
  ├── module-name.module.ts
  ├── module-name.entity.ts
  ├── module-name.providers.ts
  ├── dto/
  │   ├── create-module.dto.ts
  │   └── update-module.dto.ts
  └── module-name.service.spec.ts
```

#### Decorators Usage
- Use `@Injectable()` for services
- Use `@Controller()` for controllers with route prefix
- Use `@Public()` for public endpoints
- Use proper validation decorators from `class-validator`

### Error Handling
- Use custom exception classes extending `BaseException`
- Consistent error messages through `EXCEPTION` constants
- Proper try-catch blocks with logging
- Always log errors with `console.log(error)`

### Database Conventions
- **Table names**: snake_case with `tbl_` prefix (e.g., `tbl_user`, `tbl_user_follow`)
- **Column names**: snake_case (e.g., `user_id`, `created_at`)
- **Foreign keys**: `{table}_id` format (e.g., `user_id`, `product_id`)

### Service Patterns
- Extend `CrudService<T>` for basic CRUD operations
- Use transactions for multi-step operations
- Hash passwords using bcrypt with salt rounds = 10
- Return structured data with proper types

## Prettier Configuration
```json
{
  "singleQuote": true,
  "trailingComma": "all"
}
```

## ESLint Rules
- TypeScript recommended rules
- Prettier integration
- Interface name prefix disabled
- Explicit return types optional
- `any` type allowed (but should be used sparingly)

## Best Practices
1. **Always use TypeScript types** - Avoid `any` when possible
2. **Consistent error handling** - Use custom exceptions
3. **Transaction management** - Use transactions for data consistency
4. **Validation** - Use DTOs with class-validator decorators
5. **Documentation** - Add JSDoc comments for complex methods
6. **Testing** - Write unit tests for services and e2e tests for controllers