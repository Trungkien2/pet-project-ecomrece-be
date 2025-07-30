# Project Overview

## Purpose
This is a comprehensive e-commerce backend API built with NestJS. The project serves as a learning/portfolio project that aims to provide a complete e-commerce platform backend with features for buyers, sellers, and administrators. It supports user authentication, product management, order processing, and various e-commerce functionalities.

## Current Status & Architecture
The project is currently in **Phase 1** with a solid foundation implementing:
- Advanced authentication system with JWT and Google OAuth
- Comprehensive user management with social features
- Email service integration
- Enhanced logging and error handling
- Modular, scalable architecture following NestJS best practices

## Key Features Implemented

### Authentication & Security
- **JWT-based authentication** with configurable expiration
- **Google OAuth integration** foundation (account types: IN_APP vs GOOGLE)
- **OTP (One-Time Password) system** for email verification
- **Enhanced password management** with bcrypt hashing, validation, and reset functionality
- **Role-based access control** with custom decorators
- **Input validation** using class-validator DTOs

### User Management & Social Features
- **Complete user CRUD operations** extending base CRUD service
- **Social features**: Follow/unfollow system with user discovery
- **Enhanced user profiles** with username, bio, picture, gender fields
- **User search and filtering** capabilities
- **Pagination support** for all user listing endpoints

### Core Infrastructure
- **Modular architecture** with separation of concerns
- **Global exception handling** with custom exception types
- **Transaction management** for data consistency
- **Caching system** for OTP storage with expiration
- **Enhanced logging** with color-coded output and request tracking
- **Email service** with Nodemailer integration

## Target Users
- **End Users (Customers)**: People shopping on the platform
- **Sellers (Shop owners)**: Individuals or businesses selling products  
- **System Administrators**: Platform managers and supervisors

## Planned E-commerce Features (Future Phases)
- **Product Management**: Categories, products, variants, inventory tracking
- **Order Management**: Shopping cart, checkout process, order processing
- **Payment Integration**: Multiple payment gateway support
- **Shipping System**: Shipping methods and tracking
- **Reviews & Ratings**: Product review and rating system
- **Admin Dashboard**: Management interface for administrators
- **Analytics**: Sales reporting and user analytics
- **Search & Filtering**: Advanced product search and filtering capabilities

## Learning Objectives
This pet project demonstrates:
- Modern backend development with NestJS and TypeScript
- Database design and ORM usage with Sequelize
- Authentication and authorization patterns
- API design and documentation with Swagger
- Testing strategies (unit and e2e)
- Error handling and logging best practices
- Modular and scalable application architecture