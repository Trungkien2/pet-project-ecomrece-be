# Project Rules - E-Commerce Backend

## Kiến trúc tổng quan

- **Backend**: NestJS 9 với Sequelize + TypeScript
- **Database**: MySQL
- **ORM**: Sequelize với sequelize-typescript decorators
- **Architecture**: Backend-only API server

## Quy tắc chung

1. **Code Style**:
   - Sử dụng TypeScript strict mode
   - Tuân thủ ESLint và Prettier config
   - Đặt tên file: kebab-case cho files, camelCase cho functions/variables
   - PascalCase cho classes, interfaces, entities

2. **Git Commit**:
   - Format: `type(scope): message`
   - Types: feat, fix, docs, style, refactor, test, chore
   - Scope: module name (e.g., `feat(auth): add login endpoint`)

3. **Import Paths**:
   - Sử dụng absolute imports với `src/` prefix
   - Relative imports cho files trong cùng module
   - Không dùng `../../` quá 2 levels

4. **Testing**:
   - Unit tests cho business logic (`.spec.ts`)
   - E2E tests cho critical flows (order, payment)
   - Test files cùng folder với source files

## Module Structure

- Mỗi feature = 1 module trong `src/`
- Module structure: `entity.ts`, `dto.ts`, `service.ts`, `controller.ts`, `module.ts`, `providers.ts`
- Shared utilities → `src/core/`
- Base classes → `src/core/Base/`
