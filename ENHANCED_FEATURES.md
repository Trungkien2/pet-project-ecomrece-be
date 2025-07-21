# Nestjs-sourcebase - Enhanced Features Documentation

## Overview

This document describes the advanced features that have been integrated into the Nestjs-sourcebase project, including enhanced authentication, user management, and social features.

## New Features

### 1. Enhanced User System

#### User Entity Enhancements
- **user_name**: Optional username field
- **account_type**: ENUM ('IN_APP', 'GOOGLE') for different authentication types
- **picture**: User avatar/profile image URL
- **bio**: User biography/description
- **gender**: ENUM ('MALE', 'FEMALE')

#### Follow System
- Users can follow and unfollow each other
- Get followers list with pagination
- Get following list with pagination
- Discover new users to follow

### 2. Advanced Authentication

#### OAuth Integration
- Foundation for Google OAuth authentication
- Support for multiple account types (IN_APP vs GOOGLE)
- Email verification for Google accounts

#### OTP (One-Time Password) System
- Email-based OTP generation and verification
- Cache-based OTP storage with expiration (5 minutes)
- Secure OTP delivery via email service

#### Enhanced Password Management
- Secure bcrypt password hashing
- Password comparison and validation
- Password reset functionality with OTP verification
- Password update with current password validation
- Prevention of password reuse

#### JWT Token Management
- Enhanced token generation with user payload
- Custom token expiration configuration
- Secure token validation

### 3. Core System Improvements

#### Base CRUD Enhancements
- Enhanced pagination support with `getPagination` helper
- Paginated result interface for consistent API responses
- Transaction management improvements
- Bulk update capabilities maintained

#### Exception Handling
- New exception types for email validation
- Comprehensive error responses
- Multi-language support maintained

#### Utilities
- **Pagination Helper**: Consistent pagination across all endpoints
- **Transaction Manager**: Centralized transaction handling service
- **Email Service**: Nodemailer integration for OTP and notifications

### 4. Enhanced Logging
- Color-coded console output based on HTTP status codes
- Detailed request/response logging including:
  - Request duration timing
  - IP address and User-Agent
  - Query parameters and request body
  - Content-Length and authentication status
  - Sensitive data sanitization (passwords, tokens)

## API Endpoints

### Authentication Endpoints

#### POST /auth/register
Register a new user with enhanced fields support.

#### POST /auth/login
Login with email/password, returns JWT token.

#### POST /auth/send-otp
Send OTP to user's email for verification.

#### POST /auth/verify-otp
Verify OTP code sent to email.

#### POST /auth/reset-password
Reset password using verified OTP.

#### PUT /auth/update-password
Update password for authenticated user.

#### POST /auth/google
Google OAuth authentication (placeholder for full implementation).

### User Management Endpoints

#### POST /user/follow
Follow another user.

#### DELETE /user/unfollow
Unfollow a user.

#### GET /user/:id/followers
Get list of user's followers with pagination.

#### GET /user/:id/following
Get list of users that this user follows.

#### GET /user/discover
Discover new users to follow.

#### PATCH /user/profile
Update user profile information.

#### GET /user/:email/by-email
Find user by email address.

## Database Schema Changes

### User Table Enhancements
```sql
ALTER TABLE tbl_user ADD COLUMN user_name VARCHAR(255) NULL;
ALTER TABLE tbl_user ADD COLUMN account_type ENUM('IN_APP', 'GOOGLE') NOT NULL DEFAULT 'IN_APP';
ALTER TABLE tbl_user ADD COLUMN picture VARCHAR(255) NULL;
ALTER TABLE tbl_user ADD COLUMN bio TEXT NULL;
ALTER TABLE tbl_user ADD COLUMN gender ENUM('MALE', 'FEMALE') NULL;
```

### User Follow Table
```sql
CREATE TABLE tbl_user_follow (
  id VARCHAR(36) PRIMARY KEY,
  follower_id VARCHAR(36) NOT NULL,
  following_id VARCHAR(36) NOT NULL,
  created_at_unix_timestamp BIGINT DEFAULT 0,
  updated_at_unix_timestamp BIGINT DEFAULT 0,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (follower_id) REFERENCES tbl_user(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES tbl_user(id) ON DELETE CASCADE,
  UNIQUE KEY unique_follow_relationship (follower_id, following_id)
);
```

## Configuration

### Environment Variables
Add these to your .env file:

```env
# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourapp.com

# Database Configuration
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=password
DB_NAME_DEVELOPMENT=nestjs_dev
DB_NAME_TEST=nestjs_test
DB_NAME_PRODUCTION=nestjs_prod
```

### Dependencies Added
- `@nestjs/cache-manager` - For OTP caching
- `@nestjs/jwt` - For JWT token management
- `@nestjs/passport` - For authentication strategies
- `bcrypt` - For password hashing
- `nodemailer` - For email sending
- `cache-manager` - Caching backend

## Usage Examples

### Register with Enhanced Fields
```typescript
POST /auth/register
{
  "name": "John Doe",
  "user_name": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123",
  "bio": "Software developer",
  "gender": "MALE"
}
```

### Password Reset Flow
```typescript
// 1. Send OTP
POST /auth/send-otp
{
  "email": "john@example.com"
}

// 2. Reset password with OTP
POST /auth/reset-password
{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "newSecurePassword123"
}
```

### Follow System
```typescript
// Follow a user
POST /user/follow
{
  "followingId": "user-uuid-here"
}

// Get followers
GET /user/user-id/followers?page=1&limit=10
```

## Security Features

1. **Password Security**: All passwords are hashed using bcrypt with salt rounds
2. **OTP Security**: OTPs expire after 5 minutes and are stored in cache
3. **JWT Security**: Tokens have configurable expiration and secure signing
4. **Data Sanitization**: Sensitive data is redacted from logs
5. **SQL Injection Prevention**: Sequelize ORM provides protection
6. **Input Validation**: Class-validator ensures proper data validation

## Testing

The system includes comprehensive DTOs with validation decorators for all endpoints. To run tests:

```bash
npm test
```

Note: Some entity relationship tests may need database setup adjustments due to the enhanced schema.

## Migration

To apply database changes, run the migration:

```bash
# Add to your migration script execution
node migrations/20240720000000-enhance-user-system.js
```

## Next Steps

1. Complete Google OAuth strategy implementation
2. Add comprehensive unit tests for new features
3. Implement real-time notifications for follow events
4. Add user recommendation system
5. Implement advanced search and filtering
6. Add rate limiting for OTP requests
7. Add email templates for better user experience

## Architecture Notes

The implementation maintains backward compatibility while adding new functionality. All new features are built on top of the existing CRUD base system, leveraging dependency injection and modular architecture principles.