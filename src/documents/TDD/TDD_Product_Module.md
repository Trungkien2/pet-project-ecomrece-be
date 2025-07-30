# Technical Design Document - Product Management Module (BE.01)

## 1. Thông tin tài liệu

- **Module**: Product Management (BE.01)
- **Phiên bản**: 1.0
- **Ngày tạo**: 27/07/2025
- **Người viết**: Development Team
- **SRS Reference**: BE.01 - Quản lý Sản phẩm

## 2. Tổng quan module

Module Product Management cung cấp đầy đủ chức năng quản lý sản phẩm cho hệ thống e-commerce, bao gồm quản lý danh mục, sản phẩm, biến thể, giá cả, tồn kho và khuyến mãi.

### 2.1 Chức năng chính

- **BE.01.1**: Quản lý danh mục sản phẩm (CRUD, hỗ trợ đa cấp)
- **BE.01.2**: Quản lý sản phẩm (CRUD với SKU, mô tả, hình ảnh, trạng thái)
- **BE.01.3**: Quản lý thuộc tính và biến thể sản phẩm
- **BE.01.4**: Quản lý giá (giá gốc, giá khuyến mãi)
- **BE.01.5**: Quản lý tồn kho (nhập/cập nhật, tự động giảm/tăng)
- **BE.01.6**: Quản lý khuyến mãi (mã giảm giá, điều kiện áp dụng)

## 3. Kiến trúc module

### 3.1 Cấu trúc thư mục

```
src/product/
├── category/
│   ├── category.controller.ts
│   ├── category.service.ts
│   ├── category.entity.ts
│   ├── category.module.ts
│   ├── dto/
│   │   ├── create-category.dto.ts
│   │   ├── update-category.dto.ts
│   │   └── category-query.dto.ts
│   └── category.providers.ts
├── product/
│   ├── product.controller.ts
│   ├── product.service.ts
│   ├── product.entity.ts
│   ├── product.module.ts
│   ├── dto/
│   │   ├── create-product.dto.ts
│   │   ├── update-product.dto.ts
│   │   ├── product-query.dto.ts
│   │   └── product-variant.dto.ts
│   └── product.providers.ts
├── inventory/
│   ├── inventory.controller.ts
│   ├── inventory.service.ts
│   ├── inventory.entity.ts
│   └── dto/
│       ├── inventory-update.dto.ts
│       └── stock-adjustment.dto.ts
├── promotion/
│   ├── promotion.controller.ts
│   ├── promotion.service.ts
│   ├── promotion.entity.ts
│   └── dto/
│       ├── create-promotion.dto.ts
│       ├── update-promotion.dto.ts
│       └── apply-promotion.dto.ts
└── product.module.ts
```

### 3.2 Dependencies

- `@nestjs/common`: Controllers, Services, Guards
- `sequelize-typescript`: ORM entities và repositories
- `class-validator`: DTO validation
- `class-transformer`: Object transformation
- `@nestjs/swagger`: API documentation
- `multer`: File upload cho hình ảnh sản phẩm

## 4. Database Design

### 4.1 Category Entity

```sql
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
  FOREIGN KEY (parent_id) REFERENCES tbl_category(id) ON DELETE SET NULL,
  INDEX idx_parent_id (parent_id),
  INDEX idx_status (status),
  INDEX idx_slug (slug)
);
```

### 4.2 Product Entity

```sql
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
  INDEX idx_category_id (category_id),
  INDEX idx_status (status),
  INDEX idx_slug (slug),
  FULLTEXT idx_search (name, short_description)
);
```

### 4.3 Product Variant Entity

```sql
CREATE TABLE tbl_product_variant (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  attributes JSON,
  base_price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2) NULL,
  stock_quantity INT DEFAULT 0,
  low_stock_threshold INT DEFAULT 5,
  allow_backorder BOOLEAN DEFAULT FALSE,
  weight DECIMAL(8,2),
  dimensions JSON,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES tbl_product(id) ON DELETE CASCADE,
  INDEX idx_product_id (product_id),
  INDEX idx_sku (sku),
  INDEX idx_status (status)
);
```

### 4.4 Product Image Entity

```sql
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
  FOREIGN KEY (variant_id) REFERENCES tbl_product_variant(id) ON DELETE CASCADE,
  INDEX idx_product_id (product_id),
  INDEX idx_variant_id (variant_id)
);
```

## 5. API Endpoints

### 5.1 Category Management

```typescript
// Category Controller
@Controller('categories')
@ApiTags('categories')
export class CategoryController {
  
  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiQuery({ name: 'parent_id', required: false })
  async findAll(@Query() query: CategoryQueryDto): Promise<Category[]>

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  async findOne(@Param('id') id: string): Promise<Category>

  @Post()
  @ApiOperation({ summary: 'Create new category' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category>

  @Put(':id')
  @ApiOperation({ summary: 'Update category' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto): Promise<Category>

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string): Promise<void>
}
```

### 5.2 Product Management

```typescript
// Product Controller
@Controller('products')
@ApiTags('products')
export class ProductController {
  
  @Get()
  @ApiOperation({ summary: 'Get products with pagination and filters' })
  async findAll(@Query() query: ProductQueryDto): Promise<IPaginatedResult<Product>>

  @Get('search')
  @ApiOperation({ summary: 'Search products by keyword' })
  async search(@Query('q') keyword: string, @Query() query: ProductQueryDto): Promise<IPaginatedResult<Product>>

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID with variants' })
  async findOne(@Param('id') id: string): Promise<Product>

  @Post()
  @ApiOperation({ summary: 'Create new product' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  async create(@Body() createProductDto: CreateProductDto): Promise<Product>

  @Put(':id')
  @ApiOperation({ summary: 'Update product' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto): Promise<Product>

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string): Promise<void>

  // Variant management
  @Post(':id/variants')
  @ApiOperation({ summary: 'Add product variant' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  async addVariant(@Param('id') productId: string, @Body() variantDto: ProductVariantDto): Promise<ProductVariant>

  @Put(':id/variants/:variantId')
  @ApiOperation({ summary: 'Update product variant' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  async updateVariant(@Param('variantId') variantId: string, @Body() variantDto: ProductVariantDto): Promise<ProductVariant>
}
```

## 6. Business Logic

### 6.1 Product Service Core Methods

```typescript
@Injectable()
export class ProductService extends CrudService<Product> {
  
  // Product management
  async createProduct(createProductDto: CreateProductDto): Promise<Product>
  async updateProduct(id: string, updateProductDto: UpdateProductDto): Promise<Product>
  async deleteProduct(id: string): Promise<void>
  
  // Search and filtering
  async searchProducts(keyword: string, filters: ProductQueryDto): Promise<IPaginatedResult<Product>>
  async getProductsByCategory(categoryId: string, filters: ProductQueryDto): Promise<IPaginatedResult<Product>>
  
  // Inventory management
  async updateStock(variantId: string, quantity: number, operation: 'increase' | 'decrease'): Promise<void>
  async checkStockAvailability(variantId: string, requestedQuantity: number): Promise<boolean>
  async getLowStockProducts(): Promise<ProductVariant[]>
  
  // Price management
  async updatePrice(variantId: string, basePrice: number, salePrice?: number): Promise<ProductVariant>
  async applyBulkPriceUpdate(productIds: string[], priceAdjustment: number, type: 'percentage' | 'fixed'): Promise<void>
  
  // Image management
  async uploadProductImage(productId: string, imageFile: Express.Multer.File): Promise<ProductImage>
  async deleteProductImage(imageId: string): Promise<void>
  async reorderImages(productId: string, imageOrders: { id: string; order: number }[]): Promise<void>
}
```

### 6.2 Category Service Core Methods

```typescript
@Injectable()
export class CategoryService extends CrudService<Category> {
  
  async createCategory(createCategoryDto: CreateCategoryDto): Promise<Category>
  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category>
  async deleteCategory(id: string): Promise<void>
  
  // Hierarchy management
  async getCategoryTree(): Promise<Category[]>
  async getCategoryChildren(parentId: string): Promise<Category[]>
  async moveCategoryToParent(categoryId: string, newParentId: string): Promise<Category>
  
  // Validation
  async validateCategoryHierarchy(categoryId: string, parentId: string): Promise<boolean>
}
```

### 6.3 Inventory Service Core Methods

```typescript
@Injectable()
export class InventoryService {
  
  async adjustStock(variantId: string, adjustment: StockAdjustmentDto): Promise<void>
  async reserveStock(variantId: string, quantity: number): Promise<string> // Returns reservation ID
  async releaseReservation(reservationId: string): Promise<void>
  async confirmReservation(reservationId: string): Promise<void>
  
  // Stock monitoring
  async getLowStockAlerts(): Promise<ProductVariant[]>
  async getStockMovementHistory(variantId: string): Promise<StockMovement[]>
  async generateStockReport(filters: InventoryReportFilters): Promise<InventoryReport>
}
```

## 7. Data Transfer Objects (DTOs)

### 7.1 Product DTOs

```typescript
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsOptional()
  brandId?: string;

  @IsString()
  @IsOptional()
  skuPrefix?: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @IsString()
  @IsOptional()
  fullDescription?: string;

  @IsEnum(['published', 'draft', 'archived'])
  @IsOptional()
  status?: string = 'draft';
}

export class ProductVariantDto {
  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsObject()
  @IsOptional()
  attributes?: Record<string, any>;

  @IsNumber()
  @IsPositive()
  basePrice: number;

  @IsNumber()
  @IsOptional()
  salePrice?: number;

  @IsNumber()
  @IsOptional()
  stockQuantity?: number = 0;

  @IsNumber()
  @IsOptional()
  lowStockThreshold?: number = 5;

  @IsBoolean()
  @IsOptional()
  allowBackorder?: boolean = false;
}
```

### 7.2 Category DTOs

```typescript
export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsNumber()
  @IsOptional()
  displayOrder?: number = 0;

  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string = 'active';
}
```

## 8. Security & Authorization

### 8.1 Role-based Access Control

- **Admin**: Full access to all product management functions
- **Staff**: CRUD operations on products, categories, inventory (based on permissions)
- **Customer**: Read-only access to published products and categories

### 8.2 Data Validation

- Input validation using class-validator decorators
- File upload validation for images (size, type, dimensions)
- Business logic validation (SKU uniqueness, category hierarchy)

## 9. Performance Considerations

### 9.1 Database Optimization

- Indexes on frequently queried fields (category_id, status, slug)
- Full-text search index for product search
- Proper foreign key constraints and cascading

### 9.2 Caching Strategy

- Category tree caching (Redis)
- Product search results caching
- Image CDN for product images

### 9.3 Pagination

- Implement cursor-based pagination for large product listings
- Default page size: 20 items
- Maximum page size: 100 items

## 10. Error Handling

### 10.1 Custom Exceptions

```typescript
export class ProductNotFoundException extends BaseException {
  constructor(productId: string) {
    super(`Product with ID ${productId} not found`, 404);
  }
}

export class InsufficientStockException extends BaseException {
  constructor(available: number, requested: number) {
    super(`Insufficient stock. Available: ${available}, Requested: ${requested}`, 400);
  }
}
```

## 11. Testing Strategy

### 11.1 Unit Tests

- Service layer business logic
- DTO validation
- Utility functions

### 11.2 Integration Tests

- API endpoints
- Database operations
- File upload functionality

### 11.3 Performance Tests

- Product search with large datasets
- Concurrent stock updates
- Image upload stress testing

## 12. Monitoring & Logging

### 12.1 Key Metrics

- Product search response time
- Stock adjustment frequency
- Image upload success rate

### 12.2 Logging

- Stock level changes
- Price updates
- Product status changes
- Failed operations

## 13. Migration Strategy

### 13.1 Database Migrations

- Create category table structure
- Create product and variant tables
- Create indexes and constraints
- Seed initial category data

### 13.2 Data Migration

- Import existing product data (if any)
- Generate SKUs for existing products
- Optimize images and update URLs

## 14. Future Enhancements

- Product recommendation engine
- Advanced search with Elasticsearch
- Bulk import/export functionality
- Product variant matrix management
- Advanced inventory forecasting
