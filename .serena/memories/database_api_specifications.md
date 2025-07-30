# Database Design & API Specifications

## Complete Database Schema Design

Based on the SRS requirements, here's the comprehensive database schema needed for the e-commerce system:

### User Management (Current Implementation - Enhanced)
```sql
-- Enhanced User Table (already implemented with additions)
CREATE TABLE tbl_user (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20) UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('customer', 'staff', 'admin') DEFAULT 'customer',
  account_type ENUM('IN_APP', 'GOOGLE') DEFAULT 'IN_APP',
  picture VARCHAR(255),
  bio TEXT,
  gender ENUM('MALE', 'FEMALE'),
  email_verified_at TIMESTAMP NULL,
  phone_verified_at TIMESTAMP NULL,
  status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
  created_at_unix_timestamp BIGINT DEFAULT 0,
  updated_at_unix_timestamp BIGINT DEFAULT 0,
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User Addresses for Shipping/Billing
CREATE TABLE tbl_user_address (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  street_address TEXT NOT NULL,
  ward VARCHAR(255),
  district VARCHAR(255),
  province VARCHAR(255),
  country_code VARCHAR(2) DEFAULT 'VN',
  is_default BOOLEAN DEFAULT FALSE,
  type ENUM('shipping', 'billing', 'both') DEFAULT 'shipping',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES tbl_user(id) ON DELETE CASCADE
);
```

### Product Catalog System (To Be Implemented)
```sql
-- Product Categories (Multi-level)
CREATE TABLE tbl_category (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  parent_id VARCHAR(36) NULL,
  description TEXT,
  image_url VARCHAR(500),
  display_order INT DEFAULT 0,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES tbl_category(id) ON DELETE SET NULL
);

-- Brands (Optional)
CREATE TABLE tbl_brand (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  logo_url VARCHAR(500),
  description TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE tbl_product (
  id VARCHAR(36) PRIMARY KEY,
  category_id VARCHAR(36) NOT NULL,
  brand_id VARCHAR(36) NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  sku_prefix VARCHAR(50),
  short_description TEXT,
  full_description LONGTEXT,
  status ENUM('published', 'draft', 'archived') DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES tbl_category(id),
  FOREIGN KEY (brand_id) REFERENCES tbl_brand(id)
);

-- Product Variants (Color, Size, etc.)
CREATE TABLE tbl_product_variant (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  attributes JSON, -- {"color": "Red", "size": "M"}
  base_price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2) NULL,
  stock_quantity INT DEFAULT 0,
  low_stock_threshold INT DEFAULT 5,
  allow_backorder BOOLEAN DEFAULT FALSE,
  weight DECIMAL(8,2),
  dimensions JSON, -- {"length": 10, "width": 8, "height": 5}
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES tbl_product(id) ON DELETE CASCADE
);

-- Product Images
CREATE TABLE tbl_product_image (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL,
  variant_id VARCHAR(36) NULL,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  display_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES tbl_product(id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id) REFERENCES tbl_product_variant(id) ON DELETE CASCADE
);
```

### Shopping Cart System (To Be Implemented)
```sql
-- Shopping Carts
CREATE TABLE tbl_cart (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NULL,
  session_id VARCHAR(255) NULL, -- For guest carts
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES tbl_user(id) ON DELETE CASCADE
);

-- Cart Items
CREATE TABLE tbl_cart_item (
  id VARCHAR(36) PRIMARY KEY,
  cart_id VARCHAR(36) NOT NULL,
  product_variant_id VARCHAR(36) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price_at_add DECIMAL(10,2) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cart_id) REFERENCES tbl_cart(id) ON DELETE CASCADE,
  FOREIGN KEY (product_variant_id) REFERENCES tbl_product_variant(id)
);
```

### Order Management System (To Be Implemented)
```sql
-- Orders
CREATE TABLE tbl_order (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NULL,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  total_product_price DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  shipping_fee DECIMAL(10,2) DEFAULT 0,
  final_total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending_confirmation', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'payment_failed') DEFAULT 'pending_confirmation',
  shipping_address_id VARCHAR(36),
  billing_address_id VARCHAR(36),
  shipping_method_id VARCHAR(36),
  payment_method ENUM('cod', 'bank_transfer', 'momo', 'zalopay', 'vnpay', 'credit_card'),
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  notes_from_customer TEXT,
  internal_notes TEXT,
  shipping_tracking_number VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES tbl_user(id),
  FOREIGN KEY (shipping_address_id) REFERENCES tbl_user_address(id),
  FOREIGN KEY (billing_address_id) REFERENCES tbl_user_address(id)
);

-- Order Items
CREATE TABLE tbl_order_item (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  product_variant_id VARCHAR(36) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  variant_attributes_snapshot JSON,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES tbl_order(id) ON DELETE CASCADE,
  FOREIGN KEY (product_variant_id) REFERENCES tbl_product_variant(id)
);
```

### Promotion & Discount System (To Be Implemented)
```sql
-- Promotions/Coupons
CREATE TABLE tbl_promotion (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  type ENUM('percentage', 'fixed_amount', 'free_shipping') NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  usage_limit_per_customer INT DEFAULT 1,
  total_usage_limit INT,
  current_usage_count INT DEFAULT 0,
  min_order_value DECIMAL(10,2) DEFAULT 0,
  applicable_to ENUM('all', 'specific_products', 'specific_categories') DEFAULT 'all',
  status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Promotion Usage Tracking
CREATE TABLE tbl_promotion_usage (
  id VARCHAR(36) PRIMARY KEY,
  promotion_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NULL,
  order_id VARCHAR(36) NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (promotion_id) REFERENCES tbl_promotion(id),
  FOREIGN KEY (user_id) REFERENCES tbl_user(id),
  FOREIGN KEY (order_id) REFERENCES tbl_order(id)
);
```

### Review System (To Be Implemented)
```sql
-- Product Reviews
CREATE TABLE tbl_review (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  order_id VARCHAR(36) NULL, -- Link to purchase
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  admin_reply TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES tbl_user(id),
  FOREIGN KEY (product_id) REFERENCES tbl_product(id),
  FOREIGN KEY (order_id) REFERENCES tbl_order(id)
);
```

### Payment & Shipping (To Be Implemented)
```sql
-- Payment Transactions
CREATE TABLE tbl_payment_transaction (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  gateway_transaction_id VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  status ENUM('pending', 'success', 'failure', 'cancelled') DEFAULT 'pending',
  gateway_response_data JSON,
  processed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES tbl_order(id)
);

-- Shipping Methods
CREATE TABLE tbl_shipping_method (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  provider VARCHAR(100), -- 'GHN', 'GHTK', 'ViettelPost'
  cost_calculation_type ENUM('fixed', 'by_weight', 'by_region', 'api_calculated') DEFAULT 'fixed',
  base_cost DECIMAL(10,2) DEFAULT 0,
  cost_per_kg DECIMAL(10,2) DEFAULT 0,
  free_shipping_threshold DECIMAL(10,2),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## API Endpoint Specifications

### Authentication APIs (Currently Implemented)
```typescript
POST /auth/register - Register new user
POST /auth/login - User login
POST /auth/send-otp - Send OTP for verification
POST /auth/verify-otp - Verify OTP code
POST /auth/reset-password - Reset password with OTP
PUT /auth/update-password - Update user password
POST /auth/google - Google OAuth authentication
```

### User Management APIs (Currently Implemented)
```typescript
GET /user/profile - Get user profile
PATCH /user/profile - Update user profile
POST /user/follow - Follow another user
DELETE /user/unfollow - Unfollow user
GET /user/:id/followers - Get user followers
GET /user/:id/following - Get following users
GET /user/discover - Discover new users
```

### Product APIs (To Be Implemented)
```typescript
// Category Management
GET /categories - List all categories
POST /categories - Create category (Admin)
GET /categories/:id - Get category details
PUT /categories/:id - Update category (Admin)
DELETE /categories/:id - Delete category (Admin)

// Product Management
GET /products - List products with filtering/pagination
POST /products - Create product (Admin/Staff)
GET /products/:id - Get product details
PUT /products/:id - Update product (Admin/Staff)
DELETE /products/:id - Delete product (Admin)
GET /products/search - Search products
GET /products/featured - Get featured products

// Product Variants
GET /products/:id/variants - Get product variants
POST /products/:id/variants - Create variant (Admin/Staff)
PUT /variants/:id - Update variant (Admin/Staff)
DELETE /variants/:id - Delete variant (Admin)
```

### Shopping Cart APIs (To Be Implemented)
```typescript
GET /cart - Get user's cart
POST /cart/items - Add item to cart
PUT /cart/items/:id - Update cart item quantity
DELETE /cart/items/:id - Remove item from cart
DELETE /cart - Clear entire cart
```

### Order APIs (To Be Implemented)
```typescript
// Customer Order Management
POST /orders - Create new order
GET /orders - Get user's order history
GET /orders/:id - Get order details
PUT /orders/:id/cancel - Cancel order (if allowed)

// Admin Order Management
GET /admin/orders - List all orders (Admin/Staff)
PUT /admin/orders/:id/status - Update order status
GET /admin/orders/export - Export order data
```

### Review APIs (To Be Implemented)
```typescript
POST /products/:id/reviews - Create product review
GET /products/:id/reviews - Get product reviews
PUT /reviews/:id - Update review (own review only)
DELETE /reviews/:id - Delete review

// Admin Review Management
GET /admin/reviews - List all reviews for moderation
PUT /admin/reviews/:id/approve - Approve review
PUT /admin/reviews/:id/reject - Reject review
```

This comprehensive database design and API specification provides the foundation for implementing the complete e-commerce system according to the SRS requirements.