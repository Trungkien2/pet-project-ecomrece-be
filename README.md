# Pet Project E-commerce Backend

[![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=Sequelize&logoColor=white)](https://sequelize.org/)

A comprehensive e-commerce backend built with NestJS, featuring advanced authentication, user management, and a scalable architecture ready for e-commerce functionalities.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with Google OAuth integration
- **User Management**: Complete user system with roles and permissions
- **Email Service**: Integrated email functionality with Nodemailer
- **Database**: MySQL with Sequelize ORM and TypeScript
- **Advanced Features**: Caching, logging, error handling, and API documentation
- **Modular Architecture**: Clean, scalable code structure following NestJS best practices

## 🛠️ Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: MySQL
- **ORM**: Sequelize with TypeScript
- **Authentication**: JWT, Passport, Google OAuth
- **Documentation**: Swagger
- **Email**: Nodemailer
- **Caching**: Cache Manager
- **Testing**: Jest

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/Trungkien2/pet-project-ecomrece-be.git
cd pet-project-ecomrece-be

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run migration:run

# Start the application
npm run start:dev
```

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_DATABASE=ecommerce_db
DB_DIALECT=mysql

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email
MAIL_PASS=your_email_password

# App
PORT=3000
NODE_ENV=development
```

## 📁 Project Structure

```
src/
│
├── app.controller.ts        # Root controller
├── app.module.ts           # Root module
├── app.service.ts          # Root service
├── main.ts                 # Application entry point
├── router.ts               # Dynamic routes definition
│
├── auth/                   # Authentication module
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.ts
│   └── dto/               # Authentication DTOs
│
├── core/                  # Core utilities and shared components
│   ├── Base/             # Generic CRUD controller/service
│   ├── common/           # Common utilities
│   ├── database/         # Database configuration
│   ├── decorator/        # Custom decorators
│   ├── exception/        # Exception handling
│   ├── filter/          # Exception filters
│   ├── guards/          # Authentication guards
│   ├── interface/       # TypeScript interfaces
│   ├── middlewares/     # Custom middlewares
│   └── response/        # Standardized responses
│
├── email/               # Email service module
│   ├── email.module.ts
│   └── email.service.ts
│
└── user/               # User management module
    ├── user.controller.ts
    ├── user.entity.ts
    ├── user.module.ts
    ├── user.service.ts
    └── user.dto.ts
```

## 🎯 Core Features Explanation

### Authentication System
- JWT-based authentication
- Google OAuth integration
- Role-based access control
- Password encryption with bcrypt

### Database Layer
- Sequelize ORM with TypeScript
- Automatic migrations
- Transaction management
- Connection pooling

### Error Handling
- Global exception filter
- Custom exception types
- Multi-language error messages
- Detailed error logging

### API Documentation
- Swagger/OpenAPI integration
- Automatic schema generation
- Interactive API explorer

## 🚀 Available Scripts

```bash
# Development
npm run start:dev          # Start in development mode
npm run start:debug        # Start in debug mode

# Production
npm run build              # Build the application
npm run start:prod         # Start in production mode

# Testing
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:e2e           # Run end-to-end tests

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
```

## 📚 API Documentation

After starting the application, visit `http://localhost:3000/api` to access the Swagger documentation.

## 🔮 Planned E-commerce Features

- **Product Management**: Categories, products, variants, inventory
- **Order Management**: Shopping cart, checkout, order processing
- **Payment Integration**: Multiple payment gateways
- **Shipping**: Shipping methods and tracking
- **Reviews & Ratings**: Product reviews and rating system
- **Admin Dashboard**: Management interface
- **Analytics**: Sales and user analytics

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Trungkien2**
- GitHub: [@Trungkien2](https://github.com/Trungkien2)

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- All contributors and supporters of this project

---

**Note**: This is a pet project for learning and portfolio purposes. Feel free to use it as a reference or starting point for your own e-commerce projects.