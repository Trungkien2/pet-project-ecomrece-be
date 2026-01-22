# Task Checklist: Order Management Module (BE.02)

**TDD Reference**: `TDD_Order_Module.md`  
**Estimated Total Effort**: ~80-100 hours  
**SRS Reference**: BE.02 - Quản lý Đơn hàng

---

## Phase 1: Database & Entities

### 1.1 Order Entity
- [ ] Task 1.1.1: [DB] Create `Order` entity in `src/order/order.entity.ts` with Sequelize decorators
  - Fields: id (UUID, PK), order_number (unique), user_id (FK), status (ENUM), financial fields (subtotal, tax_amount, shipping_amount, discount_amount, total_amount, currency)
  - Billing fields: billing_name, billing_email, billing_phone, billing_address
  - Shipping fields: shipping_name, shipping_phone, shipping_address, shipping_method, shipping_tracking_number
  - Timestamps: order_date, confirmed_at, shipped_at, delivered_at, cancelled_at, created_at, updated_at
  - Optional fields: notes, admin_notes
  - Relationships: BelongsTo User, HasMany OrderItem, HasMany OrderPayment, HasMany OrderShipment
  - Indexes: idx_order_number (unique), idx_user_id, idx_status
  - Table name: `tbl_order`
  - **Estimate**: 2 hours

- [ ] Task 1.1.2: [DB] Create migration file `migrations/YYYYMMDDHHMMSS-v_1_0_0_create_tbl_order.js`
  - Table: `tbl_order`
  - Foreign key: user_id → tbl_user
  - Indexes: idx_order_number (unique), idx_user_id, idx_status
  - ENUM for status: 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
  - **Estimate**: 1.5 hours

### 1.2 Order Item Entity
- [ ] Task 1.2.1: [DB] Create `OrderItem` entity in `src/order/order-item.entity.ts` with Sequelize decorators
  - Fields: id (UUID, PK), order_id (FK), product_variant_id (FK), product_name, variant_attributes (JSON), quantity, unit_price (DECIMAL), total_price (DECIMAL), product_sku, product_image_url
  - Relationships: BelongsTo Order, BelongsTo ProductVariant
  - Indexes: idx_order_id, idx_product_variant_id
  - Table name: `tbl_order_item`
  - **Estimate**: 1.5 hours

- [ ] Task 1.2.2: [DB] Create migration file `migrations/YYYYMMDDHHMMSS-v_1_0_0_create_tbl_order_item.js`
  - Table: `tbl_order_item`
  - Foreign keys: order_id → tbl_order, product_variant_id → tbl_product_variant
  - Indexes: idx_order_id, idx_product_variant_id
  - **Estimate**: 1 hour

### 1.3 Order Payment Entity
- [ ] Task 1.3.1: [DB] Create `OrderPayment` entity in `src/order/order-payment.entity.ts` with Sequelize decorators
  - Fields: id (UUID, PK), order_id (FK), payment_method (ENUM), payment_gateway, gateway_transaction_id, status (ENUM), amount (DECIMAL), currency, payment_details (JSON), gateway_response (JSON), refund_amount (DECIMAL), refund_reason, processed_at, timestamps
  - Relationships: BelongsTo Order
  - Indexes: idx_order_id, idx_payment_method, idx_status, idx_gateway_transaction_id
  - ENUMs: payment_method ('credit_card', 'paypal', 'bank_transfer', 'cod', 'e_wallet'), status ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')
  - Table name: `tbl_order_payment`
  - **Estimate**: 2 hours

- [ ] Task 1.3.2: [DB] Create migration file `migrations/YYYYMMDDHHMMSS-v_1_0_0_create_tbl_order_payment.js`
  - Table: `tbl_order_payment`
  - Foreign key: order_id → tbl_order
  - Indexes: idx_order_id, idx_payment_method, idx_status, idx_gateway_transaction_id
  - ENUM definitions
  - **Estimate**: 1.5 hours

### 1.4 Order Shipment Entity (if needed)
- [ ] Task 1.4.1: [DB] Create `OrderShipment` entity in `src/order/order-shipment.entity.ts` with Sequelize decorators
  - Fields: id (UUID, PK), order_id (FK), carrier, tracking_number, shipped_at, delivered_at, status, notes
  - Relationships: BelongsTo Order
  - Indexes: idx_order_id, idx_tracking_number
  - Table name: `tbl_order_shipment`
  - **Estimate**: 1.5 hours

- [ ] Task 1.4.2: [DB] Create migration file `migrations/YYYYMMDDHHMMSS-v_1_0_0_create_tbl_order_shipment.js`
  - Table: `tbl_order_shipment`
  - Foreign key: order_id → tbl_order
  - Indexes: idx_order_id, idx_tracking_number
  - **Estimate**: 1 hour

### 1.5 Run Migrations
- [ ] Task 1.5.1: [DB] Run all migrations: `pnpm sequelize-cli db:migrate`
  - Verify all tables created successfully
  - Check indexes and foreign keys
  - Verify ENUM values
  - **Estimate**: 15 minutes

---

## Phase 2: Backend - Enums & Interfaces

### 2.1 Order Enums
- [ ] Task 2.1.1: [BE] Create `OrderStatus` enum in `src/order/enums/order-status.enum.ts`
  - Values: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED
  - **Estimate**: 15 minutes

- [ ] Task 2.1.2: [BE] Create `PaymentStatus` enum in `src/order/enums/payment-status.enum.ts`
  - Values: PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED, REFUNDED
  - **Estimate**: 15 minutes

- [ ] Task 2.1.3: [BE] Create `PaymentMethod` enum in `src/order/enums/payment-method.enum.ts`
  - Values: CREDIT_CARD, PAYPAL, BANK_TRANSFER, COD, E_WALLET
  - **Estimate**: 15 minutes

### 2.2 Order Interfaces
- [ ] Task 2.2.1: [BE] Create order interfaces in `src/order/interfaces/order.interface.ts`
  - IOrderService, IPaymentService, IOrderStateService interfaces if needed
  - PaymentResult interface
  - **Estimate**: 1 hour

---

## Phase 3: Backend - DTOs

### 3.1 Order DTOs
- [ ] Task 3.1.1: [BE] Create `CreateOrderDto` in `src/order/dto/create-order.dto.ts`
  - Fields: cartId (UUID, required), billingAddress (object with name, email, phone, address), shippingAddress (object with name, phone, address), shippingMethod (string), notes (optional)
  - Nested DTOs: BillingAddressDto, ShippingAddressDto
  - Validation decorators
  - **Estimate**: 1.5 hours

- [ ] Task 3.1.2: [BE] Create `OrderDto` in `src/order/dto/order.dto.ts`
  - Response DTO for order listing
  - Fields: id, orderNumber, status, totalAmount, currency, orderDate, itemCount
  - **Estimate**: 1 hour

- [ ] Task 3.1.3: [BE] Create `OrderDetailDto` in `src/order/dto/order-detail.dto.ts`
  - Extended DTO with items, payments, shipments, billing, shipping info
  - Nested DTOs: OrderItemDto, OrderPaymentDto, OrderShipmentDto
  - **Estimate**: 2 hours

- [ ] Task 3.1.4: [BE] Create `OrderQueryDto` in `src/order/dto/order-query.dto.ts`
  - Fields: status, startDate, endDate, minAmount, maxAmount, sortBy, sortOrder, page, limit
  - Validation decorators
  - **Estimate**: 1 hour

- [ ] Task 3.1.5: [BE] Create `AdminOrderQueryDto` in `src/order/dto/admin-order-query.dto.ts`
  - Extended from OrderQueryDto with additional fields: userId, orderNumber, paymentStatus
  - **Estimate**: 1 hour

- [ ] Task 3.1.6: [BE] Create `UpdateOrderStatusDto` in `src/order/dto/update-order-status.dto.ts`
  - Fields: status (OrderStatus enum), notes (optional)
  - Validation decorators
  - **Estimate**: 30 minutes

- [ ] Task 3.1.7: [BE] Create `CancelOrderDto` in `src/order/dto/cancel-order.dto.ts`
  - Fields: reason (string, optional)
  - Validation decorators
  - **Estimate**: 30 minutes

### 3.2 Payment DTOs
- [ ] Task 3.2.1: [BE] Create `PaymentRequestDto` in `src/order/dto/payment-request.dto.ts`
  - Fields: paymentMethod (PaymentMethod enum, required), gateway (string, optional), paymentDetails (object, optional)
  - Validation decorators
  - **Estimate**: 1 hour

- [ ] Task 3.2.2: [BE] Create `PaymentResultDto` in `src/order/dto/payment-result.dto.ts`
  - Response DTO for payment processing
  - Fields: success, transactionId, gatewayResponse, redirectUrl (optional)
  - **Estimate**: 30 minutes

- [ ] Task 3.2.3: [BE] Create `RefundRequestDto` in `src/order/dto/refund-request.dto.ts`
  - Fields: amount (optional, partial refund), reason (required)
  - Validation decorators
  - **Estimate**: 30 minutes

- [ ] Task 3.2.4: [BE] Create `RefundResultDto` in `src/order/dto/refund-result.dto.ts`
  - Response DTO for refund processing
  - Fields: success, refundId, refundAmount, message
  - **Estimate**: 30 minutes

---

## Phase 4: Backend - Services

### 4.1 Order Service
- [ ] Task 4.1.1: [BE] Create `OrderService` in `src/order/order.service.ts` extending `CrudService<Order>`
  - Inject Order, OrderItem, Cart, CartItem, ProductVariant repositories
  - Inject EventEmitter2 for events
  - Inject CartService, ProductService
  - Implement constructor calling super(Order)
  - **Estimate**: 1 hour

- [ ] Task 4.1.2: [BE] Implement `generateOrderNumber()` in OrderService
  - Generate unique order number (format: ORD-YYYYMMDD-XXXXXX)
  - Check uniqueness in database
  - Return string
  - **Estimate**: 2 hours

- [ ] Task 4.1.3: [BE] Implement `calculateOrderTotals(cartItems, shippingMethod)` in OrderService
  - Calculate subtotal from cart items
  - Calculate shipping amount based on method
  - Calculate tax amount (if applicable)
  - Calculate discount amount (if applicable)
  - Calculate total amount
  - Return totals object
  - **Estimate**: 2 hours

- [ ] Task 4.1.4: [BE] Implement `createOrderFromCart(cartId, orderData)` in OrderService
  - Use transaction
  - Get cart with items and product variants
  - Validate cart is not empty
  - Validate stock availability for all items
  - Generate order number
  - Calculate totals
  - Create Order record
  - Create OrderItem records (with price snapshot)
  - Update inventory (decrease stock quantities)
  - Clear cart items
  - Commit transaction
  - Emit 'order.created' event
  - Return Order
  - **Estimate**: 4 hours

- [ ] Task 4.1.5: [BE] Implement `getOrderById(orderId, includeRelations?)` in OrderService
  - Find order by id with optional eager loading
  - Include: items, payments, shipments, user
  - Throw OrderNotFoundException if not found
  - Return Order
  - **Estimate**: 1 hour

- [ ] Task 4.1.6: [BE] Implement `getUserOrders(userId, queryDto)` in OrderService
  - Find orders by user_id with pagination
  - Apply filters from queryDto (status, date range, amount range)
  - Apply sorting
  - Return paginated results
  - **Estimate**: 2 hours

- [ ] Task 4.1.7: [BE] Implement `getAllOrders(queryDto)` in OrderService
  - Find all orders with pagination (admin)
  - Apply advanced filters
  - Apply sorting
  - Return paginated results
  - **Estimate**: 2 hours

- [ ] Task 4.1.8: [BE] Implement `cancelOrder(orderId, cancelDto)` in OrderService
  - Use transaction
  - Get order and validate status (can only cancel pending/confirmed)
  - Validate status transition using OrderStateService
  - Update order status to 'cancelled'
  - Set cancelled_at timestamp
  - Restore inventory (increase stock quantities)
  - Process refund if payment was made
  - Create order history record
  - Commit transaction
  - Emit 'order.cancelled' event
  - Return Order
  - **Estimate**: 3 hours

### 4.2 Order State Service
- [ ] Task 4.2.1: [BE] Create `OrderStateService` in `src/order/order-state.service.ts`
  - Define valid status transitions as state machine
  - **Estimate**: 1 hour

- [ ] Task 4.2.2: [BE] Implement `canTransition(fromStatus, toStatus)` in OrderStateService
  - Check if transition is valid based on state machine rules
  - Return boolean
  - **Estimate**: 2 hours

- [ ] Task 4.2.3: [BE] Implement `getValidTransitions(currentStatus)` in OrderStateService
  - Return array of valid next statuses
  - **Estimate**: 1 hour

- [ ] Task 4.2.4: [BE] Implement `updateOrderStatus(orderId, newStatus, notes?)` in OrderService
  - Use transaction
  - Get order and validate exists
  - Validate status transition using OrderStateService
  - Update order status
  - Update timestamps based on status (confirmed_at, shipped_at, delivered_at, cancelled_at)
  - Create order history record
  - Commit transaction
  - Emit 'order.status.changed' event
  - Return updated Order
  - **Estimate**: 3 hours

### 4.3 Payment Service
- [ ] Task 4.3.1: [BE] Create `PaymentService` in `src/order/payment.service.ts`
  - Inject Order, OrderPayment repositories
  - Inject EventEmitter2
  - **Estimate**: 30 minutes

- [ ] Task 4.3.2: [BE] Implement `processPayment(orderId, paymentData)` in PaymentService
  - Use transaction
  - Get order with payments
  - Validate order exists and is in valid state
  - Create OrderPayment record with status 'processing'
  - Process payment based on method (call specific method handler)
  - Update payment status (completed/failed)
  - Update order status to 'confirmed' if payment successful
  - Commit transaction
  - Emit 'order.paid' event if successful
  - Return PaymentResult
  - **Estimate**: 3 hours

- [ ] Task 4.3.3: [BE] Implement `processCODPayment(order, payment)` in PaymentService
  - For COD: mark payment as completed immediately
  - Return PaymentResult with success=true
  - **Estimate**: 1 hour

- [ ] Task 4.3.4: [BE] Implement `processBankTransfer(order, payment)` in PaymentService
  - For bank transfer: mark payment as pending
  - Store payment details
  - Return PaymentResult with success=true, status=pending
  - **Estimate**: 1.5 hours

- [ ] Task 4.3.5: [BE] Implement `processEWalletPayment(order, payment, paymentData)` in PaymentService
  - Integrate with e-wallet gateway (mock or real integration)
  - Initiate payment request
  - Get redirect URL or payment link
  - Store gateway transaction ID
  - Return PaymentResult with redirectUrl
  - **Estimate**: 3 hours

- [ ] Task 4.3.6: [BE] Implement `processRefund(orderId, refundDto)` in PaymentService
  - Use transaction
  - Get order and payment
  - Validate payment can be refunded
  - Calculate refund amount (full or partial)
  - Process refund through gateway (if applicable)
  - Update payment status to 'refunded'
  - Update order status to 'refunded'
  - Create refund record
  - Commit transaction
  - Emit 'order.refunded' event
  - Return RefundResult
  - **Estimate**: 3 hours

- [ ] Task 4.3.7: [BE] Implement webhook handler for payment gateway callbacks
  - Create endpoint for payment gateway webhooks
  - Validate webhook signature
  - Update payment status based on gateway response
  - Update order status accordingly
  - **Estimate**: 2 hours

---

## Phase 5: Backend - Controllers & Guards

### 5.1 Order Controller (Customer)
- [ ] Task 5.1.1: [BE] Create `OrderController` in `src/order/order.controller.ts`
  - Decorators: @Controller('orders'), @ApiTags('orders')
  - Use @UseGuards(JwtAuthGuard) at class level
  - Inject OrderService, PaymentService
  - **Estimate**: 30 minutes

- [ ] Task 5.1.2: [BE] Implement `POST /orders` endpoint in OrderController
  - Use @Post() decorator
  - Accept CreateOrderDto in @Body()
  - Extract userId from request
  - Call createOrderFromCart()
  - Return OrderDto
  - **Estimate**: 1.5 hours

- [ ] Task 5.1.3: [BE] Implement `GET /orders` endpoint in OrderController
  - Use @Get() decorator
  - Accept OrderQueryDto in @Query()
  - Extract userId from request
  - Call getUserOrders()
  - Return paginated OrderDto
  - **Estimate**: 1.5 hours

- [ ] Task 5.1.4: [BE] Implement `GET /orders/:id` endpoint in OrderController
  - Use @Get(':id') decorator
  - Use @UseGuards(OrderAccessGuard)
  - Call getOrderById()
  - Return OrderDetailDto
  - **Estimate**: 1 hour

- [ ] Task 5.1.5: [BE] Implement `PUT /orders/:id/cancel` endpoint in OrderController
  - Use @Put(':id/cancel') decorator
  - Use @UseGuards(OrderAccessGuard)
  - Accept CancelOrderDto in @Body()
  - Call cancelOrder()
  - Return OrderDto
  - **Estimate**: 1.5 hours

- [ ] Task 5.1.6: [BE] Implement `POST /orders/:id/payment` endpoint in OrderController
  - Use @Post(':id/payment') decorator
  - Use @UseGuards(OrderAccessGuard)
  - Accept PaymentRequestDto in @Body()
  - Call processPayment()
  - Return PaymentResultDto
  - **Estimate**: 2 hours

### 5.2 Admin Order Controller
- [ ] Task 5.2.1: [BE] Create `AdminOrderController` in `src/order/admin-order.controller.ts`
  - Decorators: @Controller('admin/orders'), @ApiTags('admin-orders')
  - Use @UseGuards(JwtAuthGuard, RolesGuard) at class level
  - Use @Roles('admin', 'staff') at class level
  - Inject OrderService, PaymentService
  - **Estimate**: 30 minutes

- [ ] Task 5.2.2: [BE] Implement `GET /admin/orders` endpoint in AdminOrderController
  - Use @Get() decorator
  - Accept AdminOrderQueryDto in @Query()
  - Call getAllOrders()
  - Return paginated OrderDto
  - **Estimate**: 1.5 hours

- [ ] Task 5.2.3: [BE] Implement `PUT /admin/orders/:id/status` endpoint in AdminOrderController
  - Use @Put(':id/status') decorator
  - Accept UpdateOrderStatusDto in @Body()
  - Call updateOrderStatus()
  - Return OrderDto
  - **Estimate**: 1.5 hours

- [ ] Task 5.2.4: [BE] Implement `POST /admin/orders/:id/refund` endpoint in AdminOrderController
  - Use @Post(':id/refund') decorator
  - Accept RefundRequestDto in @Body()
  - Call processRefund()
  - Return RefundResultDto
  - **Estimate**: 2 hours

### 5.3 Order Access Guard
- [ ] Task 5.3.1: [BE] Create `OrderAccessGuard` in `src/order/guards/order-access.guard.ts`
  - Implement CanActivate interface
  - Extract orderId from request params
  - Extract userId from request
  - Get order and verify ownership (user_id matches)
  - Allow admin/staff to access any order
  - Throw ForbiddenException if access denied
  - **Estimate**: 2 hours

---

## Phase 6: Backend - Module & Providers

### 6.1 Order Module
- [ ] Task 6.1.1: [BE] Create `OrderModule` in `src/order/order.module.ts`
  - Import SequelizeModule.forFeature([Order, OrderItem, OrderPayment, OrderShipment])
  - Import UserModule (for User entity reference)
  - Import ProductModule (for ProductVariant entity reference)
  - Import CartModule (for CartService)
  - Provide OrderService, PaymentService, OrderStateService
  - Export OrderService, PaymentService
  - **Estimate**: 1 hour

- [ ] Task 6.1.2: [BE] Create `order.providers.ts` if needed for custom providers
  - Add any custom repository providers if required
  - **Estimate**: 30 minutes

- [ ] Task 6.1.3: [BE] Register OrderModule in AppModule
  - Import OrderModule in `src/app.module.ts`
  - **Estimate**: 15 minutes

---

## Phase 7: Security & Performance

### 7.1 Exception Handling
- [ ] Task 7.1.1: [BE] Create `OrderNotFoundException` in `src/order/exceptions/order-not-found.exception.ts`
  - Extend HttpException
  - Status: 404
  - **Estimate**: 30 minutes

- [ ] Task 7.1.2: [BE] Create `InvalidOrderTransitionException` in `src/order/exceptions/invalid-order-transition.exception.ts`
  - Extend HttpException
  - Status: 400
  - Include fromStatus and toStatus
  - **Estimate**: 30 minutes

- [ ] Task 7.1.3: [BE] Create `PaymentProcessingException` in `src/order/exceptions/payment-processing.exception.ts`
  - Extend HttpException
  - Status: 400 or 500
  - **Estimate**: 30 minutes

- [ ] Task 7.1.4: [BE] Add exception handling in OrderController and AdminOrderController
  - Use @UseFilters() or global exception filter
  - Handle all order-related exceptions
  - **Estimate**: 30 minutes

### 7.2 Redis Caching
- [ ] Task 7.2.1: [BE] Implement Redis caching for order details in OrderService
  - Cache key: `order:${orderId}`
  - TTL: 30 minutes
  - Cache order with items, payments, shipments
  - **Estimate**: 2 hours

- [ ] Task 7.2.2: [BE] Implement caching for user order lists
  - Cache key: `orders:user:${userId}:${queryHash}`
  - TTL: 15 minutes
  - Cache paginated results
  - **Estimate**: 2 hours

- [ ] Task 7.2.3: [BE] Implement cache invalidation on order updates
  - Invalidate cache in createOrderFromCart, updateOrderStatus, cancelOrder, processPayment
  - **Estimate**: 1 hour

### 7.3 Event Handling
- [ ] Task 7.3.1: [BE] Set up EventEmitter2 in OrderModule
  - Import EventEmitterModule
  - Configure event emitter
  - **Estimate**: 30 minutes

- [ ] Task 7.3.2: [BE] Create event listeners for order events (optional, for future integrations)
  - Listen to 'order.created', 'order.status.changed', 'order.paid', 'order.cancelled', 'order.refunded'
  - **Estimate**: 2 hours

---

## Phase 8: Testing

### 8.1 Unit Tests
- [ ] Task 8.1.1: [TEST] Write unit tests for OrderService in `src/order/order.service.spec.ts`
  - Test generateOrderNumber()
  - Test calculateOrderTotals()
  - Test createOrderFromCart() (success, empty cart, insufficient stock)
  - Test getOrderById()
  - Test getUserOrders()
  - Test getAllOrders()
  - Test cancelOrder()
  - Test updateOrderStatus()
  - Mock dependencies
  - **Estimate**: 5 hours

- [ ] Task 8.1.2: [TEST] Write unit tests for OrderStateService in `src/order/order-state.service.spec.ts`
  - Test canTransition() with all valid/invalid transitions
  - Test getValidTransitions()
  - **Estimate**: 2 hours

- [ ] Task 8.1.3: [TEST] Write unit tests for PaymentService in `src/order/payment.service.spec.ts`
  - Test processPayment() for each payment method
  - Test processCODPayment()
  - Test processBankTransfer()
  - Test processEWalletPayment()
  - Test processRefund()
  - Mock payment gateways
  - **Estimate**: 4 hours

- [ ] Task 8.1.4: [TEST] Write unit tests for DTOs validation
  - Test CreateOrderDto validation
  - Test PaymentRequestDto validation
  - Test all DTOs
  - **Estimate**: 1.5 hours

- [ ] Task 8.1.5: [TEST] Write unit tests for OrderAccessGuard
  - Test with valid ownership
  - Test with invalid ownership
  - Test with admin access
  - **Estimate**: 1.5 hours

### 8.2 Integration Tests
- [ ] Task 8.2.1: [TEST] Write integration tests for OrderController in `src/order/order.controller.spec.ts`
  - Test POST /orders
  - Test GET /orders
  - Test GET /orders/:id
  - Test PUT /orders/:id/cancel
  - Test POST /orders/:id/payment
  - Use test database
  - **Estimate**: 4 hours

- [ ] Task 8.2.2: [TEST] Write integration tests for AdminOrderController
  - Test GET /admin/orders
  - Test PUT /admin/orders/:id/status
  - Test POST /admin/orders/:id/refund
  - **Estimate**: 3 hours

- [ ] Task 8.2.3: [TEST] Write integration tests for database operations
  - Test order creation with transactions
  - Test inventory update on order creation
  - Test order status updates
  - Test rollback scenarios
  - **Estimate**: 3 hours

- [ ] Task 8.2.4: [TEST] Write integration tests for payment processing
  - Test COD payment flow
  - Test bank transfer payment flow
  - Test e-wallet payment flow (mock)
  - Test refund processing
  - **Estimate**: 3 hours

- [ ] Task 8.2.5: [TEST] Write integration tests for Redis caching
  - Test cache hit/miss scenarios
  - Test cache invalidation
  - **Estimate**: 1.5 hours

### 8.3 E2E Tests
- [ ] Task 8.3.1: [TEST] Write E2E test for complete order workflow in `test/e2e/order.e2e-spec.ts`
  - Add items to cart → Create order → Process payment → Verify order status
  - **Estimate**: 3 hours

- [ ] Task 8.3.2: [TEST] Write E2E test for payment processing flows
  - Test COD payment
  - Test bank transfer payment
  - Test e-wallet payment (mock)
  - **Estimate**: 3 hours

- [ ] Task 8.3.3: [TEST] Write E2E test for order cancellation and refund
  - Create order → Cancel order → Verify inventory restored
  - Create paid order → Process refund → Verify refund
  - **Estimate**: 2 hours

- [ ] Task 8.3.4: [TEST] Write E2E test for admin order management
  - Admin updates order status
  - Admin processes refund
  - **Estimate**: 2 hours

- [ ] Task 8.3.5: [TEST] Write E2E test for order tracking
  - Create order → Update shipping info → Verify tracking
  - **Estimate**: 1.5 hours

- [ ] Task 8.3.6: [TEST] Write E2E test for concurrent order creation
  - Simulate multiple orders for same product
  - Verify stock consistency
  - **Estimate**: 2 hours

---

## Phase 9: Documentation & API

### 9.1 API Documentation
- [ ] Task 9.1.1: [DOC] Add Swagger/OpenAPI decorators to OrderController
  - @ApiOperation for each endpoint
  - @ApiResponse for success/error responses
  - @ApiBearerAuth for authenticated endpoints
  - **Estimate**: 1 hour

- [ ] Task 9.1.2: [DOC] Add Swagger/OpenAPI decorators to AdminOrderController
  - @ApiOperation for each endpoint
  - @ApiResponse for success/error responses
  - @ApiBearerAuth with role requirements
  - **Estimate**: 1 hour

- [ ] Task 9.1.3: [DOC] Verify API documentation is generated correctly
  - Run Swagger UI
  - Verify all endpoints are documented
  - Test endpoints from Swagger UI
  - **Estimate**: 30 minutes

---

## Phase 10: Code Review & Refactoring

### 10.1 Code Review
- [ ] Task 10.1.1: [REVIEW] Review all order service methods
  - Check transaction usage
  - Check error handling
  - Check performance optimizations
  - **Estimate**: 2 hours

- [ ] Task 10.1.2: [REVIEW] Review payment service methods
  - Check payment gateway integration
  - Check error handling
  - Check security (payment data encryption)
  - **Estimate**: 2 hours

- [ ] Task 10.1.3: [REVIEW] Review controller endpoints
  - Check guard usage
  - Check DTO validation
  - Check response format
  - **Estimate**: 1.5 hours

- [ ] Task 10.1.4: [REVIEW] Review database queries
  - Check eager loading usage
  - Check index usage
  - Check N+1 query issues
  - **Estimate**: 1.5 hours

### 10.2 Refactoring
- [ ] Task 10.2.1: [REFACTOR] Optimize database queries if needed
  - Add missing indexes
  - Optimize eager loading
  - Fix N+1 queries
  - **Estimate**: 2 hours

- [ ] Task 10.2.2: [REFACTOR] Optimize order number generation
  - Ensure uniqueness without race conditions
  - Optimize database queries
  - **Estimate**: 1 hour

---

## Summary

**Total Estimated Effort**: ~80-100 hours

**Phase Breakdown**:
- Phase 1 (Database): ~10 hours
- Phase 2 (Enums & Interfaces): ~2 hours
- Phase 3 (DTOs): ~8 hours
- Phase 4 (Services): ~25 hours
- Phase 5 (Controllers & Guards): ~12 hours
- Phase 6 (Module & Providers): ~2 hours
- Phase 7 (Security & Performance): ~7 hours
- Phase 8 (Testing): ~25 hours
- Phase 9 (Documentation): ~3 hours
- Phase 10 (Review & Refactoring): ~7 hours

**Dependencies**:
- UserModule must be implemented (for User entity)
- ProductModule must be implemented (for ProductVariant entity)
- CartModule must be implemented (for CartService)
- ThrottlerModule must be configured
- Redis must be configured for caching
- EventEmitterModule must be configured
- Payment gateway integrations (for e-wallet)

**Critical Path**:
1. Database entities and migrations (Phase 1)
2. Core services: OrderService, OrderStateService (Phase 4)
3. PaymentService (Phase 4)
4. Controllers (Phase 5)
5. Testing (Phase 8)

**Important Notes**:
- Order creation must be atomic (transaction)
- Inventory must be reserved on order creation
- Price snapshot is critical (prevent disputes)
- Payment processing requires careful error handling
- State machine must enforce valid transitions
- Webhook handling for payment gateways (future enhancement)
