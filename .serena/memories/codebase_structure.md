# Codebase Structure

## Root Directory Structure
```
pet-project-ecomrece-be/
├── config/                 # Configuration files
├── documents/             # Project documentation (PRD, SRS)
├── migrations/            # Database migration files
├── src/                   # Main application source code
├── test/                  # End-to-end tests
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── nest-cli.json          # NestJS CLI configuration
├── .eslintrc.js          # ESLint configuration
├── .prettierrc           # Prettier configuration
└── .env.example          # Environment variables template
```

## Source Code Structure (`src/`)
```
src/
├── main.ts               # Application entry point
├── app.module.ts         # Root application module
├── app.controller.ts     # Root controller
├── app.service.ts        # Root service
├── router.ts             # API routing configuration
├── auth/                 # Authentication module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   └── dto/              # Data Transfer Objects
├── user/                 # User management module
│   ├── user.controller.ts
│   ├── user.service.ts
│   ├── user.module.ts
│   ├── user.entity.ts
│   ├── user.dto.ts
│   └── user.providers.ts
├── email/                # Email service module
│   ├── email.service.ts
│   └── email.module.ts
└── core/                 # Core utilities and shared components
    ├── Base/             # Base classes for CRUD operations
    ├── common/           # Common utilities
    ├── database/         # Database configuration and providers
    ├── decorator/        # Custom decorators
    ├── exception/        # Custom exception classes
    ├── filter/           # Exception filters
    ├── guards/           # Authentication guards
    ├── helper/           # Helper functions
    ├── interface/        # TypeScript interfaces
    ├── middlewares/      # Custom middlewares
    └── respone/          # HTTP response utilities
```

## Key Modules

### Core Module (`src/core/`)
- **Base**: Abstract CRUD controller and service classes
- **Database**: Sequelize configuration and entity providers
- **Exception**: Custom exception handling system
- **Guards**: JWT authentication guard
- **Middlewares**: Token validation, logging, query processing
- **Response**: Standardized HTTP response builders

### Auth Module (`src/auth/`)
- JWT-based authentication
- Google OAuth integration
- OTP system for email verification
- Password management (hashing, validation, reset)
- Multiple DTOs for different auth operations

### User Module (`src/user/`)
- User CRUD operations
- Social features (follow/unfollow system)
- User profile management
- Account type handling (IN_APP vs GOOGLE)

### Email Module (`src/email/`)
- Nodemailer integration
- Email template support
- SMTP configuration

## Database Structure
- **Migrations**: Version-controlled database schema changes
- **Entities**: Sequelize models with TypeScript decorators
- **Providers**: Database connection and model injection

## Configuration Files
- **Environment**: `.env` for database, JWT, OAuth, and email settings
- **TypeScript**: Configured for NestJS with path mapping
- **Build**: NestJS CLI with webpack for optimized builds

## Testing Structure
- **Unit Tests**: Co-located with source files (`.spec.ts`)
- **E2E Tests**: Separate `test/` directory for integration tests
- **Coverage**: Jest configuration for code coverage reports