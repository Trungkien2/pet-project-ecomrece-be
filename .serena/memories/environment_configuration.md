# Environment Configuration Guide

## Required Environment Variables

### Database Configuration
```env
# MySQL Database Settings
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_DATABASE=ecommerce_db
DB_DIALECT=mysql

# Alternative Environment-specific Databases
DB_NAME_DEVELOPMENT=nestjs_dev
DB_NAME_TEST=nestjs_test
DB_NAME_PRODUCTION=nestjs_prod
```

### Authentication & Security
```env
# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_minimum_32_characters
JWT_EXPIRES_IN=7d

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Email Service Configuration
```env
# SMTP Settings (Gmail example)
MAIL_HOST=smtp.gmail.com
SMTP_HOST=smtp.gmail.com
MAIL_PORT=587
SMTP_PORT=587
MAIL_USER=your_email@gmail.com
SMTP_USER=your_email@gmail.com
MAIL_PASS=your_app_password
SMTP_PASS=your_app_password
SMTP_FROM=noreply@yourapp.com
```

### Application Settings
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# API Settings
API_PREFIX=api
API_VERSION=v1
```

### Cache Configuration
```env
# Cache Settings (for OTP storage)
CACHE_TTL=300
OTP_EXPIRY_MINUTES=5
```

## Environment Setup Instructions

### 1. Development Setup
```bash
# Copy example environment file
copy .env.example .env

# Edit the .env file with your specific values
notepad .env  # Windows
# or use your preferred text editor
```

### 2. Database Setup
```sql
-- Create development database
CREATE DATABASE ecommerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user and grant permissions
CREATE USER 'ecommerce_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'ecommerce_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Gmail App Password Setup
For email functionality with Gmail:
1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account Settings > Security
3. Generate an "App Password" for this application
4. Use the generated app password in `MAIL_PASS` variable

### 4. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs
6. Copy Client ID and Client Secret to environment variables

## Environment-Specific Configurations

### Development Environment
```env
NODE_ENV=development
DB_DATABASE=ecommerce_dev
PORT=3000
LOG_LEVEL=debug
```

### Testing Environment
```env
NODE_ENV=test
DB_DATABASE=ecommerce_test
PORT=3001
LOG_LEVEL=error
```

### Production Environment
```env
NODE_ENV=production
DB_DATABASE=ecommerce_prod
PORT=3000
LOG_LEVEL=warn
# Use stronger JWT secret
JWT_SECRET=very_long_and_secure_production_secret_key
```

## Security Best Practices

### JWT Secret Generation
```bash
# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Password Security
- Use strong database passwords
- Never commit `.env` file to version control
- Use different credentials for each environment
- Regularly rotate secrets and passwords

### Database Security
- Use least-privilege database users
- Enable SSL for database connections in production
- Regular database backups
- Monitor database access logs

## Configuration Validation

### Environment Variable Validation
The application validates required environment variables on startup:
- Database connection parameters
- JWT secret existence and minimum length
- Email service configuration (if email features are used)

### Configuration Testing
```bash
# Test database connection
npm run start:dev
# Check console for "Database connected successfully" message

# Test email configuration
# Use the send-otp endpoint to verify email functionality

# Verify JWT configuration
# Test login endpoint and check token generation
```

## Troubleshooting Common Issues

### Database Connection Issues
1. Verify MySQL service is running
2. Check database credentials in .env
3. Ensure database exists and user has permissions
4. Check firewall settings for database port

### Email Service Issues
1. Verify SMTP credentials are correct
2. Check if 2FA and app passwords are set up
3. Ensure less secure app access is enabled (for Gmail)
4. Test SMTP connection outside the application

### JWT Token Issues
1. Ensure JWT_SECRET is at least 32 characters
2. Check token expiration settings
3. Verify token is being sent in Authorization header
4. Check for clock synchronization issues

## Development vs Production Differences

### Development
- Detailed error messages
- Debug logging enabled
- Local database connections
- Relaxed CORS settings

### Production
- Minimal error exposure
- Error logging only
- Secure database connections
- Strict CORS policy
- Environment variable validation
- Security headers enabled