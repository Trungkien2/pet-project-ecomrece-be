# Cursor Rules

Thư mục này chứa các quy tắc và hướng dẫn cho Cursor AI khi làm việc với project này.

## Cấu trúc

### Core Rules
- `project-rules.md` - Quy tắc chung cho toàn bộ project
- `backend-rules.md` - Quy tắc riêng cho backend (NestJS)
- `frontend-rules.md` - Quy tắc riêng cho frontend (Next.js)
- `database-rules.md` - Quy tắc cho database và Prisma

### Workflow Rules (`.mdc`)
- `tdd-generation-rules.mdc` - Quy tắc tạo Technical Design Document
- `task-breakdown-rules.mdc` - Quy tắc breakdown tasks từ TDD
- `implementation-rules.mdc` - Quy tắc implement tasks theo TDD và checklist
- `code-review-rules.mdc` - Quy tắc review code (Senior Architect perspective)

## Cách sử dụng

Cursor sẽ tự động đọc các file `.md` và `.mdc` trong thư mục này để hiểu context và quy tắc của project.
