# audit

Deep security & performance audit cho code.

## Usage

```
/audit @<file_path>
```

## Example

```
/audit @apps/server/src/modules/auth/auth.service.ts
```

## What it does

1. **Security Audit**
   - SQL Injection vulnerabilities
   - XSS vulnerabilities
   - Authentication/Authorization flaws
   - Sensitive data exposure
   - Input validation gaps
   - Rate limiting check

2. **Performance Audit**
   - Database query optimization
   - N+1 query detection
   - Memory leaks potential
   - Caching opportunities
   - Async/await issues

3. **Report**
   - Severity levels (Critical, High, Medium, Low)
   - Specific line references
   - Remediation suggestions

## Rules Applied

See: `.cursor/rules/code-review-rules.mdc`
