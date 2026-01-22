# Task Checklist: Shopping Cart Module (FE.03)

**TDD Reference**: `TDD_Cart_Module.md`  
**Estimated Total Effort**: ~40-50 hours  
**SRS Reference**: FE.03 - Quản lý Giỏ hàng

---

## Phase 1: Database & Entities

### 1.1 Cart Entity
- [ ] Task 1.1.1: [DB] Create `Cart` entity in `src/cart/cart.entity.ts` with Sequelize decorators
  - Fields: id (UUID, PK), user_id (FK, nullable), session_id (nullable), created_at, updated_at
  - Relationships: BelongsTo User, HasMany CartItem
  - Indexes: idx_user_id, idx_session_id
  - Table name: `tbl_cart`
  - **Estimate**: 1 hour

- [ ] Task 1.1.2: [DB] Create migration file `migrations/YYYYMMDDHHMMSS-v_1_0_0_create_tbl_cart.js`
  - Table: `tbl_cart`
  - Foreign key: user_id → tbl_user (nullable)
  - Indexes: idx_user_id, idx_session_id
  - **Estimate**: 1 hour

### 1.2 Cart Item Entity
- [ ] Task 1.2.1: [DB] Create `CartItem` entity in `src/cart/cart-item.entity.ts` with Sequelize decorators
  - Fields: id (UUID, PK), cart_id (FK), product_variant_id (FK), quantity, unit_price_at_add (DECIMAL), created_at, updated_at
  - Relationships: BelongsTo Cart, BelongsTo ProductVariant
  - Indexes: idx_cart_id, idx_product_variant_id, idx_cart_variant (unique constraint)
  - Unique constraint: (cart_id, product_variant_id)
  - Table name: `tbl_cart_item`
  - **Estimate**: 1.5 hours

- [ ] Task 1.2.2: [DB] Create migration file `migrations/YYYYMMDDHHMMSS-v_1_0_0_create_tbl_cart_item.js`
  - Table: `tbl_cart_item`
  - Foreign keys: cart_id → tbl_cart, product_variant_id → tbl_product_variant
  - Indexes: idx_cart_id, idx_product_variant_id, idx_cart_variant
  - Unique constraint: unique_cart_variant on (cart_id, product_variant_id)
  - **Estimate**: 1 hour

### 1.3 Run Migrations
- [ ] Task 1.3.1: [DB] Run all migrations: `pnpm sequelize-cli db:migrate`
  - Verify all tables created successfully
  - Check indexes and foreign keys
  - Verify unique constraints
  - **Estimate**: 15 minutes

---

## Phase 2: Backend - DTOs & Interfaces

### 2.1 Cart DTOs
- [ ] Task 2.1.1: [BE] Create `AddToCartDto` in `src/cart/dto/add-to-cart.dto.ts`
  - Fields: productVariantId (UUID, required), quantity (number, min: 1, max: 999)
  - Validation decorators: @IsUUID, @IsInt, @Min, @Max
  - **Estimate**: 30 minutes

- [ ] Task 2.1.2: [BE] Create `UpdateCartItemDto` in `src/cart/dto/update-cart-item.dto.ts`
  - Fields: quantity (number, min: 1, max: 999)
  - Validation decorators: @IsInt, @Min, @Max
  - **Estimate**: 30 minutes

- [ ] Task 2.1.3: [BE] Create `CartSummaryDto` in `src/cart/dto/cart-summary.dto.ts`
  - Fields: cartId, items (array of CartItemDto), subtotal, taxAmount, discountAmount, shippingAmount, total, itemCount
  - Nested DTO: CartItemDto (id, productVariantId, productName, variantName, quantity, unitPrice, lineTotal, imageUrl)
  - **Estimate**: 1 hour

- [ ] Task 2.1.4: [BE] Create `CartQueryDto` in `src/cart/dto/cart-query.dto.ts`
  - Fields: includeItems (boolean, default: true)
  - Validation decorators
  - **Estimate**: 30 minutes

### 2.2 Cart Interfaces
- [ ] Task 2.2.1: [BE] Create `CartCalculation` interface in `src/cart/interfaces/cart-calculation.interface.ts`
  - Fields: subtotal, taxAmount, discountAmount, shippingAmount, total, appliedPromotions (array)
  - **Estimate**: 30 minutes

- [ ] Task 2.2.2: [BE] Create cart interfaces in `src/cart/interfaces/cart.interface.ts`
  - ICartService, ICartCalculationService interfaces if needed
  - **Estimate**: 30 minutes

---

## Phase 3: Backend - Services

### 3.1 Cart Service
- [ ] Task 3.1.1: [BE] Create `CartService` in `src/cart/cart.service.ts` extending `CrudService<Cart>`
  - Inject Cart, CartItem, ProductVariant repositories
  - Implement constructor calling super(Cart)
  - **Estimate**: 30 minutes

- [ ] Task 3.1.2: [BE] Implement `getCartByUser(userId: string)` in CartService
  - Find cart by user_id with eager loading CartItem and ProductVariant
  - Return Cart or null
  - **Estimate**: 1 hour

- [ ] Task 3.1.3: [BE] Implement `getCartBySession(sessionId: string)` in CartService
  - Find cart by session_id with eager loading CartItem and ProductVariant
  - Return Cart or null
  - **Estimate**: 1 hour

- [ ] Task 3.1.4: [BE] Implement `getOrCreateCart(userId?: string, sessionId?: string)` in CartService
  - Use transaction
  - Check if cart exists (by userId or sessionId)
  - Create new cart if not exists
  - Return Cart
  - Handle transaction rollback on error
  - **Estimate**: 2 hours

- [ ] Task 3.1.5: [BE] Implement `getCartById(cartId: string)` in CartService
  - Find cart by id with eager loading items
  - Throw CartNotFoundException if not found
  - **Estimate**: 30 minutes

- [ ] Task 3.1.6: [BE] Implement `addItemToCart(cartId: string, addToCartDto: AddToCartDto)` in CartService
  - Use transaction
  - Validate stock availability (check ProductVariant.stock_quantity)
  - Throw InsufficientStockException if stock insufficient
  - Check if item already exists in cart
  - If exists: update quantity (add to existing)
  - If new: create CartItem with unit_price_at_add snapshot
  - Commit transaction
  - Return updated Cart
  - **Estimate**: 3 hours

- [ ] Task 3.1.7: [BE] Implement `updateCartItem(cartId: string, itemId: string, updateDto: UpdateCartItemDto)` in CartService
  - Use transaction
  - Validate cart ownership
  - Find CartItem by id and cart_id
  - Validate stock availability for new quantity
  - Update quantity
  - Commit transaction
  - Return updated Cart
  - **Estimate**: 2 hours

- [ ] Task 3.1.8: [BE] Implement `removeCartItem(cartId: string, itemId: string)` in CartService
  - Use transaction
  - Validate cart ownership
  - Find and delete CartItem
  - Commit transaction
  - Return updated Cart
  - **Estimate**: 1 hour

- [ ] Task 3.1.9: [BE] Implement `clearCart(cartId: string)` in CartService
  - Use transaction
  - Delete all CartItems for cart
  - Commit transaction
  - **Estimate**: 1 hour

- [ ] Task 3.1.10: [BE] Implement `mergeSessionCartToUser(sessionId: string, userId: string)` in CartService
  - Use transaction
  - Find session cart and user cart
  - For each session cart item:
    - Check if exists in user cart
    - If exists: merge quantities (add together)
    - If new: create item in user cart
  - Delete session cart after merge
  - Commit transaction
  - Return merged Cart
  - **Estimate**: 3 hours

- [ ] Task 3.1.11: [BE] Implement `getCartItemCount(cartId: string)` in CartService
  - Count total items in cart
  - Return number
  - **Estimate**: 30 minutes

### 3.2 Cart Calculation Service
- [ ] Task 3.2.1: [BE] Create `CartCalculationService` in `src/cart/cart-calculation.service.ts`
  - Inject Cart, CartItem repositories
  - **Estimate**: 30 minutes

- [ ] Task 3.2.2: [BE] Implement `calculateCartTotals(cartId: string)` in CartCalculationService
  - Load cart with items and product variants
  - Calculate subtotal: sum of (unit_price_at_add * quantity) for all items
  - Calculate discountAmount: 0 (TODO: implement promotion logic later)
  - Calculate taxAmount: 0 (TODO: implement tax calculation later)
  - Calculate shippingAmount: 0 (TODO: implement shipping calculation later)
  - Calculate total: subtotal - discountAmount + taxAmount + shippingAmount
  - Return CartCalculation interface
  - **Estimate**: 2 hours

---

## Phase 4: Backend - Controllers & Guards

### 4.1 Cart Controller
- [ ] Task 4.1.1: [BE] Create `CartController` in `src/cart/cart.controller.ts`
  - Decorators: @Controller('cart'), @ApiTags('cart')
  - Inject CartService, CartCalculationService
  - Apply @UseGuards(ThrottlerGuard) at class level
  - Apply @Throttle(100, 60) at class level (100 requests/minute)
  - **Estimate**: 30 minutes

- [ ] Task 4.1.2: [BE] Implement `GET /cart` endpoint in CartController
  - Use @Get() decorator
  - Use @UseGuards(OptionalJwtAuthGuard)
  - Extract userId or sessionId from request
  - Call getOrCreateCart()
  - Call calculateCartTotals()
  - Return CartSummaryDto
  - **Estimate**: 1.5 hours

- [ ] Task 4.1.3: [BE] Implement `POST /cart/items` endpoint in CartController
  - Use @Post('items') decorator
  - Use @UseGuards(OptionalJwtAuthGuard)
  - Apply @Throttle(20, 60) (stricter limit: 20 requests/minute)
  - Accept AddToCartDto in @Body()
  - Extract userId or sessionId from request
  - Call getOrCreateCart()
  - Call addItemToCart()
  - Call calculateCartTotals()
  - Return CartSummaryDto
  - **Estimate**: 2 hours

- [ ] Task 4.1.4: [BE] Implement `PUT /cart/items/:itemId` endpoint in CartController
  - Use @Put('items/:itemId') decorator
  - Use @UseGuards(OptionalJwtAuthGuard, CartOwnershipGuard)
  - Accept UpdateCartItemDto in @Body()
  - Extract cartId from request or find by userId/sessionId
  - Call updateCartItem()
  - Call calculateCartTotals()
  - Return CartSummaryDto
  - **Estimate**: 1.5 hours

- [ ] Task 4.1.5: [BE] Implement `DELETE /cart/items/:itemId` endpoint in CartController
  - Use @Delete('items/:itemId') decorator
  - Use @UseGuards(OptionalJwtAuthGuard, CartOwnershipGuard)
  - Extract cartId from request
  - Call removeCartItem()
  - Call calculateCartTotals()
  - Return CartSummaryDto
  - **Estimate**: 1 hour

- [ ] Task 4.1.6: [BE] Implement `DELETE /cart` endpoint in CartController
  - Use @Delete() decorator
  - Use @UseGuards(OptionalJwtAuthGuard)
  - Extract cartId from request
  - Call clearCart()
  - Return 204 No Content
  - **Estimate**: 1 hour

- [ ] Task 4.1.7: [BE] Implement `POST /cart/merge` endpoint in CartController
  - Use @Post('merge') decorator
  - Use @UseGuards(JwtAuthGuard) - requires authentication
  - Accept sessionCartData in @Body()
  - Extract userId from request
  - Extract sessionId from sessionCartData
  - Call mergeSessionCartToUser()
  - Call calculateCartTotals()
  - Return CartSummaryDto
  - **Estimate**: 2 hours

- [ ] Task 4.1.8: [BE] Implement `GET /cart/count` endpoint in CartController
  - Use @Get('count') decorator
  - Use @UseGuards(OptionalJwtAuthGuard)
  - Extract userId or sessionId from request
  - Call getOrCreateCart()
  - Call getCartItemCount()
  - Return { count: number }
  - **Estimate**: 1 hour

### 4.2 Cart Ownership Guard
- [ ] Task 4.2.1: [BE] Create `CartOwnershipGuard` in `src/cart/guards/cart-ownership.guard.ts`
  - Implement CanActivate interface
  - Extract cartId from request params
  - Extract userId or sessionId from request
  - Verify cart belongs to user/session
  - Throw ForbiddenException if ownership invalid
  - **Estimate**: 2 hours

---

## Phase 5: Backend - Module & Providers

### 5.1 Cart Module
- [ ] Task 5.1.1: [BE] Create `CartModule` in `src/cart/cart.module.ts`
  - Import SequelizeModule.forFeature([Cart, CartItem])
  - Import UserModule (for User entity reference)
  - Import ProductModule (for ProductVariant entity reference)
  - Provide CartService, CartCalculationService
  - Export CartService, CartCalculationService
  - **Estimate**: 1 hour

- [ ] Task 5.1.2: [BE] Create `cart.providers.ts` if needed for custom providers
  - Add any custom repository providers if required
  - **Estimate**: 30 minutes

- [ ] Task 5.1.3: [BE] Register CartModule in AppModule
  - Import CartModule in `src/app.module.ts`
  - **Estimate**: 15 minutes

---

## Phase 6: Security & Performance

### 6.1 Rate Limiting
- [ ] Task 6.1.1: [BE] Verify ThrottlerModule is configured in AppModule
  - Check if ThrottlerGuard is globally registered
  - Verify rate limit configuration
  - **Estimate**: 30 minutes

- [ ] Task 6.1.2: [BE] Test rate limiting on cart endpoints
  - Verify 100 requests/minute limit on general endpoints
  - Verify 20 requests/minute limit on add to cart endpoint
  - **Estimate**: 30 minutes

### 6.2 Redis Caching
- [ ] Task 6.2.1: [BE] Implement Redis caching for cart retrieval in CartService
  - Cache key: `cart:${cartId}` or `cart:user:${userId}` or `cart:session:${sessionId}`
  - TTL: 1 hour
  - Cache cart data with items
  - **Estimate**: 2 hours

- [ ] Task 6.2.2: [BE] Implement cache invalidation on cart modifications
  - Invalidate cache in addItemToCart, updateCartItem, removeCartItem, clearCart, mergeSessionCartToUser
  - **Estimate**: 1 hour

- [ ] Task 6.2.3: [BE] Implement caching for cart item count
  - Cache key: `cart:count:${cartId}`
  - TTL: 5 minutes
  - Invalidate on cart modifications
  - **Estimate**: 1 hour

### 6.3 Exception Handling
- [ ] Task 6.3.1: [BE] Create `CartNotFoundException` in `src/cart/exceptions/cart-not-found.exception.ts`
  - Extend HttpException
  - Status: 404
  - **Estimate**: 30 minutes

- [ ] Task 6.3.2: [BE] Create `InsufficientStockException` in `src/cart/exceptions/insufficient-stock.exception.ts`
  - Extend HttpException
  - Status: 400
  - Include product name, available stock, requested quantity
  - **Estimate**: 30 minutes

- [ ] Task 6.3.3: [BE] Add exception handling in CartController
  - Use @UseFilters() or global exception filter
  - Handle CartNotFoundException, InsufficientStockException
  - **Estimate**: 30 minutes

---

## Phase 7: Testing

### 7.1 Unit Tests
- [ ] Task 7.1.1: [TEST] Write unit tests for CartService in `src/cart/cart.service.spec.ts`
  - Test getCartByUser()
  - Test getCartBySession()
  - Test getOrCreateCart() (both create and get existing)
  - Test addItemToCart() (new item, existing item, insufficient stock)
  - Test updateCartItem()
  - Test removeCartItem()
  - Test clearCart()
  - Test mergeSessionCartToUser()
  - Test getCartItemCount()
  - Mock dependencies (Cart, CartItem, ProductVariant)
  - **Estimate**: 4 hours

- [ ] Task 7.1.2: [TEST] Write unit tests for CartCalculationService in `src/cart/cart-calculation.service.spec.ts`
  - Test calculateCartTotals() with various scenarios
  - Test with empty cart
  - Test with multiple items
  - Verify calculation accuracy
  - Mock dependencies
  - **Estimate**: 2 hours

- [ ] Task 7.1.3: [TEST] Write unit tests for DTOs validation
  - Test AddToCartDto validation (valid, invalid UUID, invalid quantity)
  - Test UpdateCartItemDto validation
  - **Estimate**: 1 hour

- [ ] Task 7.1.4: [TEST] Write unit tests for CartOwnershipGuard
  - Test with valid ownership
  - Test with invalid ownership
  - Test with missing cart
  - **Estimate**: 1.5 hours

### 7.2 Integration Tests
- [ ] Task 7.2.1: [TEST] Write integration tests for CartController in `src/cart/cart.controller.spec.ts`
  - Test GET /cart (authenticated, guest)
  - Test POST /cart/items (authenticated, guest, insufficient stock)
  - Test PUT /cart/items/:itemId
  - Test DELETE /cart/items/:itemId
  - Test DELETE /cart
  - Test POST /cart/merge
  - Test GET /cart/count
  - Use test database
  - **Estimate**: 4 hours

- [ ] Task 7.2.2: [TEST] Write integration tests for database operations
  - Test cart creation with transactions
  - Test cart item operations with transactions
  - Test cart merge with transactions
  - Test rollback scenarios
  - **Estimate**: 2 hours

- [ ] Task 7.2.3: [TEST] Write integration tests for Redis caching
  - Test cache hit/miss scenarios
  - Test cache invalidation
  - **Estimate**: 1.5 hours

### 7.3 E2E Tests
- [ ] Task 7.3.1: [TEST] Write E2E test for complete cart flow in `test/e2e/cart.e2e-spec.ts`
  - Add item → Update quantity → Remove item → Clear cart
  - Verify cart persistence
  - **Estimate**: 2 hours

- [ ] Task 7.3.2: [TEST] Write E2E test for cart merge after login
  - Create session cart as guest
  - Login as user
  - Merge cart
  - Verify merged items
  - **Estimate**: 2 hours

- [ ] Task 7.3.3: [TEST] Write E2E test for price snapshot
  - Add item to cart (note price)
  - Change product price
  - Verify cart still shows old price
  - **Estimate**: 1.5 hours

- [ ] Task 7.3.4: [TEST] Write E2E test for stock validation
  - Add item with quantity exceeding stock
  - Verify error response
  - **Estimate**: 1 hour

- [ ] Task 7.3.5: [TEST] Write E2E test for concurrent cart operations
  - Simulate multiple requests adding same item
  - Verify data consistency
  - **Estimate**: 2 hours

---

## Phase 8: Documentation & API

### 8.1 API Documentation
- [ ] Task 8.1.1: [DOC] Add Swagger/OpenAPI decorators to CartController
  - @ApiOperation for each endpoint
  - @ApiResponse for success/error responses
  - @ApiBearerAuth for authenticated endpoints
  - **Estimate**: 1 hour

- [ ] Task 8.1.2: [DOC] Verify API documentation is generated correctly
  - Run Swagger UI
  - Verify all endpoints are documented
  - Test endpoints from Swagger UI
  - **Estimate**: 30 minutes

---

## Phase 9: Code Review & Refactoring

### 9.1 Code Review
- [ ] Task 9.1.1: [REVIEW] Review all cart service methods
  - Check transaction usage
  - Check error handling
  - Check performance optimizations
  - **Estimate**: 1 hour

- [ ] Task 9.1.2: [REVIEW] Review controller endpoints
  - Check guard usage
  - Check DTO validation
  - Check response format
  - **Estimate**: 1 hour

- [ ] Task 9.1.3: [REVIEW] Review database queries
  - Check eager loading usage
  - Check index usage
  - Check N+1 query issues
  - **Estimate**: 1 hour

### 9.2 Refactoring
- [ ] Task 9.2.1: [REFACTOR] Optimize database queries if needed
  - Add missing indexes
  - Optimize eager loading
  - Fix N+1 queries
  - **Estimate**: 2 hours

---

## Summary

**Total Estimated Effort**: ~40-50 hours

**Phase Breakdown**:
- Phase 1 (Database): ~4 hours
- Phase 2 (DTOs & Interfaces): ~3 hours
- Phase 3 (Services): ~15 hours
- Phase 4 (Controllers & Guards): ~11 hours
- Phase 5 (Module & Providers): ~2 hours
- Phase 6 (Security & Performance): ~6 hours
- Phase 7 (Testing): ~18 hours
- Phase 8 (Documentation): ~2 hours
- Phase 9 (Review & Refactoring): ~5 hours

**Dependencies**:
- UserModule must be implemented (for User entity)
- ProductModule must be implemented (for ProductVariant entity)
- ThrottlerModule must be configured
- Redis must be configured for caching
- OptionalJwtAuthGuard must be implemented

**Critical Path**:
1. Database entities and migrations (Phase 1)
2. Core services (Phase 3)
3. Controllers (Phase 4)
4. Testing (Phase 7)
