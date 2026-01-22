# tasks

Tạo Task Breakdown Checklist từ Technical Design Document.

## Usage

```
/tasks @<tdd_file>.md
```

## Example

```
/tasks @docs/Fe/screens/register/tdd-register.md
```

## What it does

1. Đọc TDD document
2. Break down thành actionable tasks (1-4 hours mỗi task)
3. Group theo phases:
   - Database
   - Backend (NestJS)
   - Frontend (Next.js)
   - Testing
   - Integration & QA
4. Tạo dependency graph
5. Estimate effort

## Output

File: `tasks-<feature>.md` trong cùng folder với TDD

## Rules Applied

See: `.cursor/rules/task-breakdown-rules.mdc`
