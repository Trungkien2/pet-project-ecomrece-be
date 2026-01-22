# scaffold-be

Scaffold Backend code (NestJS) - tạo structure only, không implement business logic.

## Usage

```
/scaffold-be
Task document: @<task_file>.md
Technical Design Document: @<tdd_file>.md
Phase: [Phase number]
```

## Example

```
/scaffold-be
Task document: @docs/Fe/screens/register/tasks-register.md
Technical Design Document: @docs/Fe/screens/register/tdd-register.md
Phase: Phase 1
```

## What it does

1. Đọc TDD và Task document
2. Tạo DTOs với validation (class-validator)
3. Tạo Service với method signatures (TODO comments cho complex logic)
4. Tạo Controller với endpoints và decorators
5. Tạo/Update Module
6. Register trong AppModule (nếu module mới)
7. Cập nhật task checklist với status `✅ (Scaffolded)`

## Rules Applied

See: `.cursor/rules/scaffold-be-rules.mdc`
