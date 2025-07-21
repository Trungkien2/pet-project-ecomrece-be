
## Cấu trúc thư mục `src/`

Thư mục `src/` là nơi chứa toàn bộ mã nguồn chính của ứng dụng NestJS. Dưới đây là mô tả chi tiết các thành phần và vai trò của từng thư mục/file:

```
src/
│
├── app.controller.ts        // Controller gốc, ví dụ cho cấu trúc controller
├── app.module.ts            // Module gốc, khởi tạo các module con
├── app.service.ts           // Service gốc, ví dụ cho cấu trúc service
├── main.ts                  // Điểm khởi chạy ứng dụng NestJS
├── router.ts                // Định nghĩa các route động (nếu có)
│
├── auth/                    // Module xác thực (authentication)
│   ├── auth.controller.ts       // Xử lý các endpoint liên quan đến xác thực
│   ├── auth.module.ts           // Định nghĩa module xác thực
│   ├── auth.service.ts          // Xử lý logic xác thực
│   ├── dto/                     // Các Data Transfer Object cho auth
│   │   ├── auth-advanced.dto.ts
│   │   ├── create-auth.dto.ts
│   │   ├── login-auth.dto.ts
│   │   └── update-auth.dto.ts
│   └── ... (test, spec)
│
├── core/                    // Các thành phần cốt lõi, dùng chung toàn hệ thống
│   ├── Base/                    // CRUD controller/service dùng chung
│   │   ├── crud.controller.ts
│   │   └── crud.service.ts
│   ├── common/                  // Tiện ích chung (ví dụ: transaction manager)
│   │   └── transactionManager.ts
│   ├── contanst/                // Enum, hằng số (lưu ý typo: nên là constants)
│   │   └── language.enum.ts
│   ├── contants/                // Hằng số chung (lưu ý typo: nên là constants)
│   │   └── index.ts
│   ├── database/                // Cấu hình và provider cho database
│   │   ├── database.config.ts
│   │   ├── database.module.ts
│   │   ├── database.providers.ts
│   │   └── entity.ts
│   ├── decorator/               // Các custom decorator
│   │   ├── public-private.decorator.ts
│   │   ├── public.decorator.ts
│   │   └── query-info.decorator.ts
│   ├── exception/               // Xử lý exception, custom exception
│   │   ├── base.exception.ts
│   │   ├── exception.ts
│   │   └── index.ts
│   ├── filter/                  // Exception filter
│   │   ├── all-exception.filter.ts
│   │   └── index.ts
│   ├── guards/                  // Guard (ví dụ: JWT guard)
│   │   └── jwt-auth.guard.ts
│   ├── helper/                  // Helper function dùng chung
│   │   └── index.ts
│   ├── interface/               // Định nghĩa interface, DTO dùng chung
│   │   ├── db.interface.ts
│   │   ├── exception.interface.ts
│   │   └── query-info.dto.ts
│   ├── middlewares/             // Middleware custom
│   │   ├── checkToken.middleware.ts
│   │   ├── logs.middleware.ts
│   │   ├── query.middleware.ts
│   │   └── index.ts
│   └── respone/                 // Định nghĩa response chuẩn
│       └── http-respone.ts
│
├── email/                   // Module gửi email
│   ├── email.module.ts
│   └── email.service.ts
│
└── user/                    // Module quản lý user
    ├── user.controller.ts       // Xử lý các endpoint liên quan đến user
    ├── user.dto.ts              // Định nghĩa DTO cho user
    ├── user.entity.ts           // Định nghĩa entity user
    ├── user.module.ts           // Định nghĩa module user
    ├── user.providers.ts        // Provider cho user
    ├── user.service.ts          // Xử lý logic liên quan đến user
    └── ... (test, spec)
```

### Giải thích thêm

- **Module**: Mỗi thư mục lớn như `auth/`, `user/`, `email/` là một module độc lập, tuân theo kiến trúc module của NestJS.
- **core/**: Chứa các thành phần dùng chung, tiện ích, custom decorator, middleware, guard, exception, filter, interface, helper, v.v.
- **database/**: Cấu hình, provider, entity liên quan đến database.
- **decorator/**: Các decorator tự định nghĩa để dùng cho controller, method, v.v.
- **middlewares/**: Các middleware custom cho request/response.
- **exception/**, **filter/**: Xử lý lỗi và filter lỗi toàn cục.
- **respone/**: Chuẩn hóa response trả về client.
- **contanst/**, **contants/**: Lưu ý có thể bị typo, nên thống nhất lại thành `constants/`.

### Lưu ý khi phát triển

- Tuân thủ chuẩn module hóa của NestJS.
- Đặt tên file, thư mục rõ ràng, nhất quán.
- Tách biệt rõ ràng giữa controller, service, module, DTO, entity.
- Sử dụng các thành phần trong `core/` để tránh lặp lại code.
- Đọc kỹ các custom decorator, middleware, guard để hiểu luồng xử lý request/response.

## Detailed Explanation of the `src/core/` Module (Based on Actual Code)

The `src/core/` directory contains core components, utilities, and shared logic used throughout the application. Below is a detailed explanation of each subfolder and file, based on the actual code:

### 1. Base/
- **crud.controller.ts**: Defines a generic CRUD controller for entities, using custom decorators (`@Public`, `@PublicPrivate`, `@ApiQueryInfo`, `@QueryInfo`) to control access and extract query info. Integrates with the CRUD service for DB operations and provides standardized response helpers.
- **crud.service.ts**: Generic CRUD service for Sequelize entities. Provides methods for list, pagination, item, create, update, bulk update, delete, deleteAll, transaction, and error handling. Integrates with custom exceptions and pagination helpers.

### 2. common/
- **transactionManager.ts**: Service for managing Sequelize transactions. Provides `transaction()` to create a new transaction and `executeInTransaction()` to run a callback within a transaction, handling commit/rollback automatically.

### 3. contanst/ (typo, should be constants)
- **language.enum.ts**: Enum `HostLanguage` for supported languages (e.g., 'ko', 'en'), used for multi-language support.

### 4. contants/ (typo, should be constants)
- **index.ts**: Common constants for the app, such as `SEQUELIZE`, `DEVELOPMENT`, `TEST`, `PRODUCTION`, `USER_REPOSITORY`.

### 5. database/
- **entity.ts**: Re-exports the user entity for centralized Sequelize entity imports.
- **database.config.ts**: Database configuration for different environments (development, test, production), reading from environment variables.
- **database.module.ts**: Declares the NestJS database module, exporting database providers.
- **database.providers.ts**: Defines Sequelize providers, configures entities, sets up hooks for create/update/destroy, and exports aliases, entities, and the sequelize instance.

### 6. decorator/
- **query-info.decorator.ts**: Custom decorator `@QueryInfo()` to extract query info from requests, and `@ApiQueryInfo()` for Swagger documentation. Defines `QueryDto` for query parameters.
- **public-private.decorator.ts**: Decorator `@PublicPrivate()` to mark routes as public/private using metadata.
- **public.decorator.ts**: Decorator `@Public()` to mark routes as public (no authentication required).

### 7. exception/
- **exception.ts**: Defines the `EXCEPTION` object with many error types, multi-language messages, status codes, and types for database, auth, user, router, etc.
- **base.exception.ts**: `BaseException` class extends Error, standardizes custom exceptions using the `IException` interface.
- **index.ts**: Exports main exceptions and defines special exceptions (`AuthException`, `RouterException`, `DatabaseException`, `FirebaseException`) extending `BaseException` with default error types.

### 8. filter/
- **all-exception.filter.ts**: Global exception filter for NestJS. Catches all errors, logs them, and returns a standardized response (with language support) using `HttpResponse`.
- **index.ts**: (Empty, can be used to export filters.)

### 9. guards/
- **jwt-auth.guard.ts**: JWT authentication guard for NestJS. Extracts token from header, verifies it with JwtService, attaches payload to request, or throws UnauthorizedException if invalid.

### 10. helper/
- **index.ts**: Defines `IPaginationResult` and `getPagination()` for calculating pagination info (current_page, next_page, prev_page, total_pages, total_count, limit, offset).

### 11. interface/
- **db.interface.ts**: Interfaces for database configuration (`IDatabaseConfigAttributes`, `IDatabaseConfig`).
- **exception.interface.ts**: Interfaces for exceptions (`IHLException` for multi-language messages, `IException` for standardized error structure).
- **query-info.dto.ts**: `QueryInfoDto` class for advanced query parameters (where, limit, page, offset, order, attributes, include, distinct, paranoid, transaction, etc.).

### 12. middlewares/
- **query.middleware.ts**: Middleware for advanced query parameter parsing. Parses where, order, fields, limit, page, offset, attributes, include, paranoid, and attaches to `req.queryInfo`.
- **checkToken.middleware.ts**: Middleware to check token in header and decode it using JwtService (does not fully validate, just decodes).
- **logs.middleware.ts**: Middleware for detailed request/response logging: method, url, status, duration, ip, user-agent, content-length, query, sanitized body, and logs to console and NestJS logger.
- **index.ts**: Exports main middlewares.

### 13. respone/
- **http-respone.ts**: Defines `HttpResponse<T>` and `HttpResponseBuilder<T>` for standardized client responses (statusCode, type, message, data), with Swagger integration for response documentation.

---

> **Note:** There are some typos in folder names (`contanst`, `contants`, `respone`). It is recommended to rename them to `constants` and `response` for consistency and clarity.

This section is based on the actual code and will help developers understand the purpose and usage of each file in the `core` module. For further details on any specific file, see the code comments or ask for a deep dive into that file.
