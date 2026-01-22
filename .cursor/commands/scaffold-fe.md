# scaffold-fe

Scaffold Frontend code (Next.js) - tạo structure only, không implement complex logic.

## Usage

```
/scaffold-fe
Task document: @<task_file>.md
Technical Design Document: @<tdd_file>.md
Phase: [Phase number]
```

## Example

```
/scaffold-fe
Task document: @docs/Fe/screens/register/tasks-register.md
Technical Design Document: @docs/Fe/screens/register/tdd-register.md
Phase: Phase 2
```

## What it does

1. Đọc TDD và Task document
2. Install dependencies nếu cần (e.g., `use-debounce`)
3. Tạo Validation Schema (Zod)
4. Tạo API functions với types
5. Tạo Components (Client/Server)
6. Tạo Page
7. Cập nhật task checklist với status `✅ (Scaffolded)`

## Rules Applied

See: `.cursor/rules/scaffold-fe-rules.mdc`
