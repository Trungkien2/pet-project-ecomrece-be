# review

Review code với Senior Architect perspective.

## Usage

```
/review @<file_path>
```

## Example

```
/review @apps/server/src/modules/auth/auth.service.ts
```

## What it does

1. Analyze code structure và patterns
2. Check coding standards compliance
3. Review security considerations
4. Check performance implications
5. Suggest improvements
6. Rate code quality

## Focus Areas

- **Architecture**: Module structure, dependencies
- **Security**: Input validation, auth, data exposure
- **Performance**: N+1 queries, caching, indexing
- **Maintainability**: DRY, SOLID, readability
- **Error Handling**: Exceptions, edge cases

## Rules Applied

See: `.cursor/rules/code-review-rules.mdc`
