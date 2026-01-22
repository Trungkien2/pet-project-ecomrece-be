# implement

Full implementation với business logic theo TDD và Task document.

## Usage

```
/implement
Task document: @<task_file>.md
Technical Design Document: @<tdd_file>.md
```

## Example

```
/implement
Task document: @docs/Fe/screens/register/tasks-register.md
Technical Design Document: @docs/Fe/screens/register/tdd-register.md
```

## What it does

1. Kiểm tra status của tasks trong task document
2. Review TDD sections liên quan
3. Implement đầy đủ business logic
4. Thêm error handling
5. Thêm JSDoc comments
6. Cập nhật task checklist với status `✅ (Completed)`
7. Suggest commit message

## Rules Applied

See: `.cursor/rules/implementation-rules.mdc`
