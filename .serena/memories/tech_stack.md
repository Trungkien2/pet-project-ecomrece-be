# Tech Stack

## Core Framework
- **Framework**: NestJS (v9.x)
- **Language**: TypeScript (v5.x)
- **Runtime**: Node.js

## Database & ORM
- **Database**: MySQL (v8.x)
- **ORM**: Sequelize with sequelize-typescript (v6.x)
- **Database Driver**: mysql2

## Authentication & Security
- **Authentication**: JWT (@nestjs/jwt v10.x)
- **Passport Strategies**: Local & Google OAuth 2.0
- **Password Hashing**: bcrypt
- **Middleware**: Custom token validation, logging, query processing

## Email & Communication
- **Email Service**: Nodemailer (v7.x)
- **Email Provider**: SMTP (Gmail supported)

## Caching & Performance
- **Caching**: @nestjs/cache-manager with cache-manager
- **Validation**: class-validator for DTO validation

## Development Tools
- **Build Tool**: NestJS CLI
- **Bundler**: Webpack (v5.x)
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier
- **Testing**: Jest (unit & e2e tests)

## API Documentation
- **Documentation**: Swagger (@nestjs/swagger)
- **API Design**: RESTful APIs with proper HTTP status codes

## Configuration
- **Environment**: dotenv for environment variable management
- **Config Management**: @nestjs/config module

## Utilities
- **Utility Library**: lodash
- **Reflection**: reflect-metadata
- **Reactive Programming**: RxJS