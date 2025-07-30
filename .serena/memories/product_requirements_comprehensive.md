# Comprehensive Product Requirements (PRD & SRS)

## Project Vision (from PRD)
**Comprehensive E-commerce System** - A complete online platform connecting buyers and sellers, enabling shopping, selling, order management, payments, and delivery in a convenient and secure manner. The platform aims to enhance user experience while ensuring transparency and safety in e-commerce transactions.

## System Scope & Architecture (from SRS)
This is a **single-store e-commerce system** (one business/store selling their products), not a multi-vendor marketplace. The system provides a comprehensive solution from product management, orders, customers to payment integration and shipping.

## Target Users & Roles

### 1. End Users (Customers)
- Browse and purchase products
- Manage personal profiles and order history
- Write product reviews and feedback

### 2. Sellers (Shop Owners) 
- Register seller accounts
- Upload and manage products
- Manage orders and inventory
- Handle promotions and view sales statistics

### 3. System Administrators
- Manage users (customers & sellers)
- Review/moderate products
- Manage product categories and orders
- Handle reports and complaints
- Access system dashboard and analytics

## Detailed Feature Requirements

### Customer Features (FE.01-FE.06)
1. **Account Management**
   - Registration via email/phone with OTP verification
   - Login with email/phone and password
   - Social login (Google, Facebook - optional)
   - Password recovery via email/SMS
   - Profile management with shipping addresses

2. **Product Browsing & Search**
   - Browse by multi-level categories
   - Product detail pages with variants (color, size)
   - Search by keywords, SKU
   - Advanced filtering (price range, category, attributes)
   - Sorting options (price, newest, bestselling)

3. **Shopping Cart Management**
   - Add products with variants
   - Update quantities, remove items
   - Persistent cart for logged-in users
   - Automatic total calculation

4. **Order & Checkout Process**
   - Complete checkout flow with shipping address
   - Multiple shipping methods with automatic fee calculation
   - Payment options: COD, Bank Transfer, E-wallets (Momo, ZaloPay, VNPay)
   - Coupon/discount code application
   - Order confirmation and email notifications

5. **Order Tracking**
   - View order history and status
   - Track order progress (pending → processing → shipped → delivered)
   - Optional order cancellation

6. **Product Reviews**
   - Rate products (1-5 stars) after purchase
   - Write comments/reviews
   - Reviews displayed on product pages after moderation

### Admin/Staff Features (BE.01-BE.07)
1. **Product Management**
   - CRUD operations for categories (multi-level hierarchy)
   - Product management with SKU, descriptions, images
   - Variant management (attributes, pricing, inventory)
   - Inventory tracking with automatic updates
   - Promotion and discount management

2. **Order Management**
   - View all orders with filtering and search
   - Update order status with email notifications
   - Print invoices and shipping labels
   - Internal notes for orders

3. **Customer Management**
   - View customer information and purchase history
   - Account activation/deactivation (Admin only)

4. **Shipping Management**
   - Configure shipping methods and rates
   - Integration with shipping providers (GHN, GHTK, ViettelPost)
   - Automatic shipping fee calculation

5. **Review Moderation**
   - Approve/reject customer reviews
   - Reply to customer comments
   - Remove inappropriate content

6. **System Administration**
   - User role and permission management
   - System configuration (store info, email, payments)
   - Static page content management

7. **Reports & Analytics**
   - Revenue reports (daily, weekly, monthly)
   - Product performance analytics
   - Order status reports
   - Customer analytics
   - Export capabilities (Excel, CSV)

## Technology Stack Requirements (from PRD)

### Backend (Current Implementation)
- **Framework**: NestJS
- **Database**: MySQL with Sequelize ORM  
- **Authentication**: JWT with refresh tokens

### Frontend (Planned)
- **Framework**: React
- **Styling**: TailwindCSS

### Infrastructure (Planned)
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render/Railway
- **File Storage**: AWS S3
- **CI/CD**: GitHub Actions

## Database Schema (from SRS)
Key entities include:
- **User**: Complete user profiles with roles
- **Product/ProductVariant**: Product catalog with variants
- **Category**: Multi-level product categories
- **Order/OrderItem**: Order management system
- **Cart/CartItem**: Shopping cart functionality
- **Review**: Product review system
- **Address**: Customer shipping addresses
- **PaymentTransaction**: Payment tracking
- **Promotion**: Discount and coupon system

## Development Timeline (from PRD)
- **Sprint 1**: Authentication system and user roles (1 week)
- **Sprint 2**: Basic shopping features (cart, orders) (2 weeks)
- **Sprint 3**: Seller module (product/order management) (2 weeks)
- **Sprint 4**: Admin panel + dashboard + reports (2 weeks)
- **Sprint 5**: UI/UX refinement, testing, deployment (2 weeks)

## Non-Functional Requirements
- **Performance**: Page load < 2-3 seconds, support thousands of concurrent users
- **Security**: Password encryption, JWT authentication, CSRF protection, basic DDoS protection
- **Scalability**: Support for thousands of concurrent users
- **Availability**: 99.9% uptime minimum
- **Responsiveness**: Compatible with desktop, mobile, tablet devices

## Success Metrics (KPIs)
- Minimum 100 users in first month (PRD) / 1000 users in first 3 months (SRS)
- 80% order completion without errors
- Homepage load time < 2 seconds
- System uptime ≥ 99%
- Conversion rate ≥ 2%
- Order completion rate ≥ 20%

## Current Implementation Status
**Phase 1 Complete**: Authentication, user management, social features, email service
**Next Phases**: Product catalog, shopping cart, order management, payment integration

## Key Integrations Required
- **Payment Gateways**: Momo, ZaloPay, VNPay, bank transfers
- **Shipping Services**: GHN, GHTK, ViettelPost APIs
- **Email Service**: SMTP for notifications and OTP
- **File Storage**: Image upload and management