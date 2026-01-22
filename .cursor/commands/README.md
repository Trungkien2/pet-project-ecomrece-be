# Cursor Commands

Thư mục này chứa các custom commands/aliases cho Cursor AI.

## Available Commands

### `/review`
Review code với Senior Architect perspective.

**Usage:**
```
/review [file_path]
/review @file.ts
/review
```

**What it does:**
- Applies `code-review-rules.mdc`
- Reviews for: Performance, Security, Design Patterns, Edge Cases
- Output format: [Problem] -> [Solution] -> [Why]

**Examples:**
```bash
/review @apps/server/src/modules/auth/auth.service.ts
/review @apps/web/components/auth/login-form.tsx
/review  # Reviews current file
```

### `/audit`
Comprehensive security & performance audit.

**Usage:**
```
/audit [file_path]
/audit @file.ts
/audit
```

**What it does:**
- Deep dive security audit (SQL Injection, XSS, IDOR, etc.)
- Performance analysis (N+1 queries, memory leaks)
- Scalability concerns
- Best practices violations

**Examples:**
```bash
/audit @apps/server/src/modules/auth/auth.service.ts
/audit  # Audits current file
```

## How to Use

1. **In Chat**: Type `/review` or `/audit` followed by file path
2. **With @ mention**: Use `@file.ts` to reference specific files
3. **Current file**: Just type `/review` without arguments to review current file

## Integration

These commands automatically apply:
- `code-review-rules.mdc` for review guidelines
- Project-specific rules from `.cursor/rules/`
- Best practices from `backend-rules.md`, `frontend-rules.md`, etc.
