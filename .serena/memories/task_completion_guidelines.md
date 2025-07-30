# Task Completion Guidelines

## Code Quality Checklist

### Before Committing Code
1. **Format Code**: Run `npm run format` to ensure consistent formatting
2. **Lint Code**: Run `npm run lint` to check and fix code quality issues
3. **Run Tests**: Execute `npm run test` to ensure all tests pass
4. **Type Check**: Verify TypeScript compilation with `npm run build`

### After Making Changes
1. **Test Functionality**: 
   - Start dev server: `npm run start:dev`
   - Test API endpoints manually or with tools like Postman
   - Verify database operations if applicable

2. **Review Code**:
   - Check for proper error handling
   - Ensure consistent naming conventions
   - Verify proper use of DTOs and validation
   - Confirm transaction usage for multi-step operations

3. **Documentation**:
   - Update inline comments for complex logic
   - Update API documentation if endpoints changed
   - Update README if new features or setup steps added

## Testing Strategy

### Unit Testing
- **Services**: Test business logic and database operations
- **Controllers**: Test request handling and response formatting
- **Utilities**: Test helper functions and core utilities
- **Coverage**: Aim for >80% coverage on critical business logic

### E2E Testing
- **Authentication flows**: Login, registration, password reset
- **API endpoints**: Full request-response cycles
- **Integration**: Database operations and external services

### Commands for Testing
```bash
# Run all tests
npm run test

# Run with coverage
npm run test:cov

# Run specific test file
npm run test -- user.service.spec.ts

# Run e2e tests
npm run test:e2e
```

## Database Management

### Migration Guidelines
1. **Always create migrations** for schema changes
2. **Test migrations** on development database first
3. **Backup production data** before running migrations
4. **Use descriptive names** for migration files

### Common Migration Commands
```bash
# Create new migration
npm run migration:generate -- --name add_new_feature

# Run pending migrations
npm run migration:run

# Revert last migration (if needed)
npm run migration:revert
```

## Deployment Preparation

### Production Readiness Checklist
1. **Environment Variables**: Ensure all required env vars are set
2. **Security**: Verify JWT secrets, database credentials
3. **Performance**: Check for N+1 queries, add indexes where needed
4. **Logging**: Ensure proper error logging is in place
5. **Health Checks**: Verify application starts and responds correctly

### Build and Deployment
```bash
# Production build
npm run build

# Start production server
npm run start:prod
```

## Code Review Standards

### Before Submitting PR
1. Self-review code changes
2. Ensure commit messages are descriptive
3. Run full test suite
4. Check for any hardcoded values that should be environment variables

### Review Criteria
- **Functionality**: Does the code work as intended?
- **Security**: Are there any security vulnerabilities?
- **Performance**: Are there any performance issues?
- **Maintainability**: Is the code readable and well-structured?
- **Testing**: Are appropriate tests included?

## Troubleshooting

### Common Issues
1. **Port conflicts**: Use `netstat -ano | findstr :3000` and kill process if needed
2. **Database connection**: Verify .env settings match your local MySQL setup
3. **Module not found**: Clear node_modules and reinstall with `npm install`
4. **TypeScript errors**: Check imports and type definitions

### Debug Commands
```bash
# Start in debug mode
npm run start:debug

# Debug tests
npm run test:debug
```