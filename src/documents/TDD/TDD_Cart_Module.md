# Technical Design Document - Shopping Cart Module (FE.03)

## 1. Thông tin tài liệu

- **Module**: Shopping Cart Management (FE.03)
- **Phiên bản**: 1.0
- **Ngày tạo**: 27/07/2025
- **Người viết**: Development Team
- **SRS Reference**: FE.03 - Quản lý Giỏ hàng

## 2. Tổng quan module

Module Shopping Cart cung cấp đầy đủ chức năng quản lý giỏ hàng cho khách hàng, hỗ trợ cả khách hàng đã đăng nhập và khách vãng lai.

### 2.1 Chức năng chính

- **FE.03.1**: Thêm sản phẩm và biến thể vào giỏ hàng
- **FE.03.2**: Xem chi tiết giỏ hàng với thông tin đầy đủ
- **FE.03.3**: Cập nhật số lượng sản phẩm trong giỏ
- **FE.03.4**: Xóa sản phẩm khỏi giỏ hàng
- **FE.03.5**: Tự động tính toán tổng tiền
- **FE.03.6**: Lưu trữ giỏ hàng cho khách đăng nhập

## 3. Kiến trúc module

### 3.1 Cấu trúc thư mục

```
src/cart/
├── cart.controller.ts
├── cart.service.ts
├── cart.module.ts
├── entities/
│   ├── cart.entity.ts
│   └── cart-item.entity.ts
├── dto/
│   ├── add-to-cart.dto.ts
│   ├── update-cart-item.dto.ts
│   ├── cart-summary.dto.ts
│   └── cart-query.dto.ts
├── interfaces/
│   ├── cart.interface.ts
│   └── cart-calculation.interface.ts
├── guards/
│   └── cart-ownership.guard.ts
└── cart.providers.ts
```

### 3.2 Dependencies

- `@nestjs/common`: Controllers, Services
- `sequelize-typescript`: ORM entities
- `class-validator`: DTO validation
- `@nestjs/cache-manager`: Session cart caching
- `uuid`: Session ID generation

## 4. Database Design

### 4.1 Cart Entity

```sql
CREATE TABLE tbl_cart (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NULL,
  session_id VARCHAR(255) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES tbl_user(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_session_id (session_id),
  CONSTRAINT chk_cart_identity CHECK (
    (user_id IS NOT NULL AND session_id IS NULL) OR 
    (user_id IS NULL AND session_id IS NOT NULL)
  )
);
```

### 4.2 Cart Item Entity

```sql
CREATE TABLE tbl_cart_item (
  id VARCHAR(36) PRIMARY KEY,
  cart_id VARCHAR(36) NOT NULL,
  product_variant_id VARCHAR(36) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price_at_add DECIMAL(10,2) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cart_id) REFERENCES tbl_cart(id) ON DELETE CASCADE,
  FOREIGN KEY (product_variant_id) REFERENCES tbl_product_variant(id),
  UNIQUE KEY unique_cart_variant (cart_id, product_variant_id),
  INDEX idx_cart_id (cart_id),
  INDEX idx_product_variant_id (product_variant_id),
  CONSTRAINT chk_positive_quantity CHECK (quantity > 0)
);
```

## 5. API Endpoints

### 5.1 Cart Controller

```typescript
@Controller('cart')
@ApiTags('cart')
export class CartController {
  
  @Get()
  @ApiOperation({ summary: 'Get current cart' })
  @UseGuards(OptionalJwtAuthGuard)
  async getCart(@Req() request: Request): Promise<CartSummaryDto>

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  @UseGuards(OptionalJwtAuthGuard)
  async addItem(@Body() addToCartDto: AddToCartDto, @Req() request: Request): Promise<CartSummaryDto>

  @Put('items/:itemId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @UseGuards(OptionalJwtAuthGuard, CartOwnershipGuard)
  async updateItem(@Param('itemId') itemId: string, @Body() updateDto: UpdateCartItemDto): Promise<CartSummaryDto>

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @UseGuards(OptionalJwtAuthGuard, CartOwnershipGuard)
  async removeItem(@Param('itemId') itemId: string, @Req() request: Request): Promise<CartSummaryDto>

  @Delete()
  @ApiOperation({ summary: 'Clear entire cart' })
  @UseGuards(OptionalJwtAuthGuard)
  async clearCart(@Req() request: Request): Promise<void>

  @Post('merge')
  @ApiOperation({ summary: 'Merge session cart with user cart after login' })
  @UseGuards(JwtAuthGuard)
  async mergeCart(@Body() sessionCartData: any, @Req() request: Request): Promise<CartSummaryDto>

  @Get('count')
  @ApiOperation({ summary: 'Get cart items count' })
  @UseGuards(OptionalJwtAuthGuard)
  async getCartCount(@Req() request: Request): Promise<{ count: number }>
}
```

## 6. Business Logic

### 6.1 Cart Service Core Methods

```typescript
@Injectable()
export class CartService {
  
  // Cart retrieval
  async getCartByUser(userId: string): Promise<Cart>
  async getCartBySession(sessionId: string): Promise<Cart>
  async getOrCreateCart(userId?: string, sessionId?: string): Promise<Cart>

  // Item management
  async addItemToCart(cartIdentifier: CartIdentifier, addToCartDto: AddToCartDto): Promise<Cart>
  async updateCartItem(itemId: string, quantity: number): Promise<CartItem>
  async removeCartItem(itemId: string): Promise<void>
  async clearCart(cartId: string): Promise<void>

  // Cart calculations
  async calculateCartTotals(cartId: string): Promise<CartCalculation>
  async validateCartItems(cartId: string): Promise<CartValidationResult>
  async applyPromotionToCart(cartId: string, promotionCode: string): Promise<CartCalculation>

  // Session management
  async mergeSessionCartToUser(sessionId: string, userId: string): Promise<Cart>
  async transferCartOwnership(fromSessionId: string, toUserId: string): Promise<Cart>

  // Stock validation
  async validateItemStock(variantId: string, quantity: number): Promise<boolean>
  async reserveCartItems(cartId: string): Promise<string[]> // Returns reservation IDs
  async releaseCartReservations(reservationIds: string[]): Promise<void>

  // Price validation
  async updateCartItemPrices(cartId: string): Promise<void>
  async checkPriceChanges(cartId: string): Promise<PriceChangeAlert[]>
}
```

### 6.2 Cart Calculation Service

```typescript
@Injectable()
export class CartCalculationService {
  
  async calculateSubtotal(cartItems: CartItem[]): Promise<number>
  async calculateTaxes(cartItems: CartItem[], shippingAddress?: Address): Promise<number>
  async calculateShipping(cartItems: CartItem[], shippingMethod: ShippingMethod): Promise<number>
  async applyDiscounts(subtotal: number, promotions: Promotion[]): Promise<DiscountCalculation>
  async calculateTotal(cartCalculation: CartCalculation): Promise<number>
  
  // Weight and dimension calculations
  async calculateTotalWeight(cartItems: CartItem[]): Promise<number>
  async calculateTotalDimensions(cartItems: CartItem[]): Promise<Dimensions>
}
```

## 7. Data Transfer Objects (DTOs)

### 7.1 Cart DTOs

```typescript
export class AddToCartDto {
  @IsString()
  @IsNotEmpty()
  productVariantId: string;

  @IsNumber()
  @IsPositive()
  @Max(999)
  quantity: number;

  @IsObject()
  @IsOptional()
  customization?: Record<string, any>;
}

export class UpdateCartItemDto {
  @IsNumber()
  @IsPositive()
  @Max(999)
  quantity: number;
}

export class CartSummaryDto {
  id: string;
  items: CartItemDto[];
  itemCount: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  shippingEstimate?: number;
  total: number;
  lastUpdated: Date;
  priceAlerts?: PriceChangeAlert[];
  stockAlerts?: StockAlert[];
}

export class CartItemDto {
  id: string;
  productVariantId: string;
  productName: string;
  variantAttributes: Record<string, any>;
  quantity: number;
  unitPrice: number;
  currentPrice: number;
  subtotal: number;
  imageUrl: string;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  maxQuantity: number;
  priceChanged: boolean;
}
```

### 7.2 Calculation DTOs

```typescript
export interface CartCalculation {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  shippingAmount: number;
  total: number;
  appliedPromotions: AppliedPromotion[];
}

export interface PriceChangeAlert {
  itemId: string;
  productName: string;
  oldPrice: number;
  newPrice: number;
  changeType: 'increase' | 'decrease';
}

export interface StockAlert {
  itemId: string;
  productName: string;
  requestedQuantity: number;
  availableQuantity: number;
  status: 'low_stock' | 'out_of_stock';
}
```

## 8. Business Rules

### 8.1 Cart Item Management Rules

```typescript
export class CartBusinessRules {
  
  // Maximum items per cart
  static readonly MAX_ITEMS_PER_CART = 100;
  
  // Maximum quantity per item
  static readonly MAX_QUANTITY_PER_ITEM = 999;
  
  // Cart expiration rules
  static readonly GUEST_CART_EXPIRY_DAYS = 7;
  static readonly USER_CART_EXPIRY_DAYS = 30;
  
  // Stock reservation
  static readonly STOCK_RESERVATION_MINUTES = 15;
  
  static validateCartLimits(cart: Cart): ValidationResult {
    if (cart.items.length >= this.MAX_ITEMS_PER_CART) {
      throw new CartLimitExceededException('Maximum items per cart exceeded');
    }
    
    for (const item of cart.items) {
      if (item.quantity > this.MAX_QUANTITY_PER_ITEM) {
        throw new CartLimitExceededException('Maximum quantity per item exceeded');
      }
    }
    
    return { valid: true };
  }
  
  static shouldUpdatePrice(item: CartItem, currentPrice: number): boolean {
    // Update if price difference is more than 1%
    const priceThreshold = item.unitPrice * 0.01;
    return Math.abs(item.unitPrice - currentPrice) > priceThreshold;
  }
}
```

### 8.2 Cart Merge Logic

```typescript
export class CartMergeService {
  
  async mergeSessionCartToUser(sessionCart: Cart, userCart: Cart): Promise<Cart> {
    const mergedItems = new Map<string, CartItem>();
    
    // Add user cart items first
    for (const item of userCart.items) {
      mergedItems.set(item.productVariantId, item);
    }
    
    // Merge session cart items
    for (const sessionItem of sessionCart.items) {
      const existingItem = mergedItems.get(sessionItem.productVariantId);
      
      if (existingItem) {
        // Combine quantities, respecting max limits
        const newQuantity = Math.min(
          existingItem.quantity + sessionItem.quantity,
          CartBusinessRules.MAX_QUANTITY_PER_ITEM
        );
        existingItem.quantity = newQuantity;
      } else {
        mergedItems.set(sessionItem.productVariantId, sessionItem);
      }
    }
    
    // Update user cart with merged items
    await this.updateCartItems(userCart.id, Array.from(mergedItems.values()));
    
    // Delete session cart
    await this.deleteCart(sessionCart.id);
    
    return userCart;
  }
}
```

## 9. Caching Strategy

### 9.1 Redis Caching

```typescript
@Injectable()
export class CartCacheService {
  
  private readonly CART_CACHE_TTL = 3600; // 1 hour
  private readonly CART_COUNT_CACHE_TTL = 300; // 5 minutes
  
  async cacheCart(cartId: string, cart: CartSummaryDto): Promise<void> {
    const cacheKey = `cart:${cartId}`;
    await this.cacheManager.set(cacheKey, cart, this.CART_CACHE_TTL);
  }
  
  async getCachedCart(cartId: string): Promise<CartSummaryDto | null> {
    const cacheKey = `cart:${cartId}`;
    return await this.cacheManager.get(cacheKey);
  }
  
  async invalidateCartCache(cartId: string): Promise<void> {
    const cacheKey = `cart:${cartId}`;
    await this.cacheManager.del(cacheKey);
  }
  
  async cacheCartCount(identifier: string, count: number): Promise<void> {
    const cacheKey = `cart:count:${identifier}`;
    await this.cacheManager.set(cacheKey, count, this.CART_COUNT_CACHE_TTL);
  }
}
```

## 10. Security & Authorization

### 10.1 Cart Ownership Guard

```typescript
@Injectable()
export class CartOwnershipGuard implements CanActivate {
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const sessionId = request.session?.id;
    const itemId = request.params.itemId;
    
    const cartItem = await this.cartService.getCartItem(itemId);
    
    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }
    
    const cart = await this.cartService.getCartById(cartItem.cartId);
    
    // Check ownership
    if (cart.userId && user?.id === cart.userId) {
      return true;
    }
    
    if (cart.sessionId && sessionId === cart.sessionId) {
      return true;
    }
    
    throw new ForbiddenException('Access denied to cart item');
  }
}
```

### 10.2 Rate Limiting

```typescript
// Apply rate limiting to cart operations
@Controller('cart')
@UseGuards(ThrottlerGuard)
@Throttle(100, 60) // 100 requests per minute
export class CartController {
  
  @Post('items')
  @Throttle(20, 60) // Stricter limit for add to cart
  async addItem(@Body() addToCartDto: AddToCartDto, @Req() request: Request): Promise<CartSummaryDto>
}
```

## 11. Error Handling

### 11.1 Custom Exceptions

```typescript
export class CartLimitExceededException extends BaseException {
  constructor(message: string) {
    super(message, 400);
  }
}

export class InsufficientStockException extends BaseException {
  constructor(productName: string, available: number, requested: number) {
    super(`Insufficient stock for ${productName}. Available: ${available}, Requested: ${requested}`, 400);
  }
}

export class CartItemNotFoundException extends BaseException {
  constructor(itemId: string) {
    super(`Cart item with ID ${itemId} not found`, 404);
  }
}

export class PriceChangedException extends BaseException {
  constructor(changedItems: PriceChangeAlert[]) {
    super('Some item prices have changed. Please review your cart.', 409, { changedItems });
  }
}
```

## 12. Event System

### 12.1 Cart Events

```typescript
export class CartEventService {
  
  @OnEvent('cart.item.added')
  async handleItemAdded(event: CartItemAddedEvent): Promise<void> {
    // Update user activity
    // Trigger recommendation updates
    // Update analytics
  }
  
  @OnEvent('cart.item.removed')
  async handleItemRemoved(event: CartItemRemovedEvent): Promise<void> {
    // Release stock reservations
    // Update analytics
  }
  
  @OnEvent('cart.abandoned')
  async handleCartAbandoned(event: CartAbandonedEvent): Promise<void> {
    // Send abandoned cart email
    // Update conversion analytics
  }
  
  @OnEvent('cart.converted')
  async handleCartConverted(event: CartConvertedEvent): Promise<void> {
    // Clear cart
    // Update conversion analytics
    // Trigger order processing
  }
}
```

## 13. Performance Optimization

### 13.1 Database Optimization

- Use efficient joins for cart item queries
- Implement proper indexing on cart and cart_item tables
- Use bulk operations for cart updates

### 13.2 Caching Strategy

- Cache frequently accessed carts
- Cache cart item counts
- Use Redis for session cart storage

### 13.3 Background Processing

```typescript
@Injectable()
export class CartMaintenanceService {
  
  @Cron('0 0 * * *') // Daily at midnight
  async cleanupExpiredCarts(): Promise<void> {
    const expiredCarts = await this.cartService.getExpiredCarts();
    await this.cartService.deleteCartsBatch(expiredCarts.map(c => c.id));
  }
  
  @Cron('*/15 * * * *') // Every 15 minutes
  async updateCartPrices(): Promise<void> {
    const activeCarts = await this.cartService.getActiveCarts();
    await this.cartService.validateAndUpdatePrices(activeCarts);
  }
  
  @Cron('*/5 * * * *') // Every 5 minutes
  async releaseExpiredReservations(): Promise<void> {
    await this.inventoryService.releaseExpiredReservations();
  }
}
```

## 14. Monitoring & Analytics

### 14.1 Key Metrics

- Cart abandonment rate
- Average cart value
- Items per cart
- Cart conversion rate
- Price change impact

### 14.2 Logging

```typescript
@Injectable()
export class CartLogger {
  
  logCartAction(action: string, cartId: string, details: any): void {
    this.logger.log({
      action,
      cartId,
      timestamp: new Date(),
      details
    });
  }
  
  logPriceChange(cartId: string, changes: PriceChangeAlert[]): void {
    this.logger.warn({
      event: 'cart_price_change',
      cartId,
      changes,
      timestamp: new Date()
    });
  }
  
  logStockIssue(cartId: string, stockAlerts: StockAlert[]): void {
    this.logger.warn({
      event: 'cart_stock_issue',
      cartId,
      stockAlerts,
      timestamp: new Date()
    });
  }
}
```

## 15. Testing Strategy

### 15.1 Unit Tests

- Cart service business logic
- Cart calculation accuracy
- DTO validation
- Business rules enforcement

### 15.2 Integration Tests

- API endpoints functionality
- Database operations
- Cache operations
- Event handling

### 15.3 E2E Tests

- Complete cart flow (add → update → remove → clear)
- Cart merge scenarios
- Price and stock validation
- Session management

## 16. Future Enhancements

- Save for later functionality
- Cart sharing between users
- Advanced cart analytics
- AI-powered cart recommendations
- Multi-currency support
- Cart import/export functionality
