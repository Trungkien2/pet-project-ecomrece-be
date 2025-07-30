# Technical Design Document - Order Management Module (BE.02)

## 1. Thông tin tài liệu

- **Module**: Order Management (BE.02)
- **Phiên bản**: 1.0
- **Ngày tạo**: 27/07/2025
- **Người viết**: Development Team
- **SRS Reference**: BE.02 - Quản lý Đơn hàng

## 2. Tổng quan module

Module Order Management quản lý toàn bộ vòng đời của đơn hàng từ khi tạo đến khi hoàn thành, bao gồm xử lý thanh toán, quản lý trạng thái và tích hợp với các dịch vụ bên ngoài.

### 2.1 Chức năng chính

- **BE.02.1**: Tạo đơn hàng từ giỏ hàng
- **BE.02.2**: Xử lý thanh toán qua các gateway
- **BE.02.3**: Quản lý trạng thái đơn hàng
- **BE.02.4**: Cập nhật thông tin giao hàng
- **BE.02.5**: Hủy và hoàn tiền đơn hàng
- **BE.02.6**: Tạo hóa đơn và báo cáo

## 3. Kiến trúc module

### 3.1 Cấu trúc thư mục

```
src/order/
├── order.controller.ts
├── order.service.ts
├── order.module.ts
├── entities/
│   ├── order.entity.ts
│   ├── order-item.entity.ts
│   ├── order-payment.entity.ts
│   ├── order-shipment.entity.ts
│   └── order-history.entity.ts
├── dto/
│   ├── create-order.dto.ts
│   ├── update-order.dto.ts
│   ├── order-query.dto.ts
│   ├── payment-request.dto.ts
│   └── shipment-update.dto.ts
├── services/
│   ├── payment.service.ts
│   ├── shipment.service.ts
│   ├── invoice.service.ts
│   └── order-state.service.ts
├── enums/
│   ├── order-status.enum.ts
│   ├── payment-status.enum.ts
│   └── shipment-status.enum.ts
├── interfaces/
│   ├── order.interface.ts
│   ├── payment-gateway.interface.ts
│   └── shipment-provider.interface.ts
├── guards/
│   └── order-access.guard.ts
└── order.providers.ts
```

### 3.2 Dependencies

- `@nestjs/common`: Controllers, Services
- `sequelize-typescript`: ORM entities
- `@nestjs/bull`: Queue management for async processing
- `@nestjs/event-emitter`: Event-driven architecture
- `stripe`: Payment processing
- `paypal-rest-sdk`: PayPal integration
- `node-cron`: Scheduled tasks

## 4. Database Design

### 4.1 Order Entity

```sql
CREATE TABLE tbl_order (
  id VARCHAR(36) PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
  subtotal DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  shipping_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'VND',
  
  -- Billing Information
  billing_name VARCHAR(255) NOT NULL,
  billing_email VARCHAR(255) NOT NULL,
  billing_phone VARCHAR(20),
  billing_address TEXT NOT NULL,
  billing_city VARCHAR(100) NOT NULL,
  billing_state VARCHAR(100),
  billing_postal_code VARCHAR(20),
  billing_country VARCHAR(2) NOT NULL DEFAULT 'VN',
  
  -- Shipping Information
  shipping_name VARCHAR(255) NOT NULL,
  shipping_phone VARCHAR(20),
  shipping_address TEXT NOT NULL,
  shipping_city VARCHAR(100) NOT NULL,
  shipping_state VARCHAR(100),
  shipping_postal_code VARCHAR(20),
  shipping_country VARCHAR(2) NOT NULL DEFAULT 'VN',
  shipping_method VARCHAR(50),
  shipping_tracking_number VARCHAR(100),
  
  -- Special Instructions
  notes TEXT,
  admin_notes TEXT,
  
  -- Timestamps
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  confirmed_at DATETIME NULL,
  shipped_at DATETIME NULL,
  delivered_at DATETIME NULL,
  cancelled_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES tbl_user(id),
  INDEX idx_order_number (order_number),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_order_date (order_date),
  INDEX idx_total_amount (total_amount)
);
```

### 4.2 Order Item Entity

```sql
CREATE TABLE tbl_order_item (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  product_variant_id VARCHAR(36) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  variant_attributes JSON,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  
  -- Product snapshot at order time
  product_sku VARCHAR(100),
  product_image_url VARCHAR(500),
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES tbl_order(id) ON DELETE CASCADE,
  FOREIGN KEY (product_variant_id) REFERENCES tbl_product_variant(id),
  INDEX idx_order_id (order_id),
  INDEX idx_product_variant_id (product_variant_id)
);
```

### 4.3 Order Payment Entity

```sql
CREATE TABLE tbl_order_payment (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  payment_method ENUM('credit_card', 'paypal', 'bank_transfer', 'cod', 'e_wallet') NOT NULL,
  payment_gateway VARCHAR(50),
  gateway_transaction_id VARCHAR(255),
  status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'VND',
  
  -- Payment details (encrypted)
  payment_details JSON,
  
  -- Gateway response
  gateway_response JSON,
  
  -- Refund information
  refund_amount DECIMAL(12,2) DEFAULT 0,
  refund_reason TEXT,
  
  processed_at DATETIME NULL,
  failed_at DATETIME NULL,
  refunded_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES tbl_order(id) ON DELETE CASCADE,
  INDEX idx_order_id (order_id),
  INDEX idx_status (status),
  INDEX idx_gateway_transaction_id (gateway_transaction_id),
  INDEX idx_payment_method (payment_method)
);
```

### 4.4 Order Shipment Entity

```sql
CREATE TABLE tbl_order_shipment (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  shipping_provider VARCHAR(100),
  tracking_number VARCHAR(100),
  status ENUM('pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned') DEFAULT 'pending',
  
  -- Shipping details
  shipped_from_address TEXT,
  estimated_delivery_date DATE,
  actual_delivery_date DATETIME NULL,
  
  -- Package information
  package_weight DECIMAL(8,2),
  package_dimensions VARCHAR(100),
  
  -- Tracking events
  tracking_events JSON,
  
  -- Timestamps
  shipped_at DATETIME NULL,
  delivered_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES tbl_order(id) ON DELETE CASCADE,
  INDEX idx_order_id (order_id),
  INDEX idx_tracking_number (tracking_number),
  INDEX idx_status (status),
  INDEX idx_shipped_at (shipped_at)
);
```

### 4.5 Order History Entity

```sql
CREATE TABLE tbl_order_history (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  action VARCHAR(100) NOT NULL,
  from_status VARCHAR(50),
  to_status VARCHAR(50),
  notes TEXT,
  performed_by VARCHAR(36),
  performed_by_type ENUM('user', 'admin', 'system') DEFAULT 'system',
  metadata JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES tbl_order(id) ON DELETE CASCADE,
  INDEX idx_order_id (order_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
);
```

## 5. API Endpoints

### 5.1 Order Controller

```typescript
@Controller('orders')
@ApiTags('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  
  @Post()
  @ApiOperation({ summary: 'Create new order from cart' })
  async createOrder(@Body() createOrderDto: CreateOrderDto, @Request() req): Promise<OrderDto>

  @Get()
  @ApiOperation({ summary: 'Get user orders with pagination' })
  async getOrders(@Query() queryDto: OrderQueryDto, @Request() req): Promise<PaginatedOrderDto>

  @Get(':id')
  @ApiOperation({ summary: 'Get order details' })
  @UseGuards(OrderAccessGuard)
  async getOrder(@Param('id') id: string): Promise<OrderDetailDto>

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel order' })
  @UseGuards(OrderAccessGuard)
  async cancelOrder(@Param('id') id: string, @Body() cancelDto: CancelOrderDto): Promise<OrderDto>

  @Post(':id/payment')
  @ApiOperation({ summary: 'Process payment for order' })
  @UseGuards(OrderAccessGuard)
  async processPayment(@Param('id') id: string, @Body() paymentDto: PaymentRequestDto): Promise<PaymentResultDto>

  @Get(':id/invoice')
  @ApiOperation({ summary: 'Download order invoice' })
  @UseGuards(OrderAccessGuard)
  async downloadInvoice(@Param('id') id: string, @Res() response: Response): Promise<void>

  @Get(':id/tracking')
  @ApiOperation({ summary: 'Get order tracking information' })
  @UseGuards(OrderAccessGuard)
  async getTracking(@Param('id') id: string): Promise<TrackingInfoDto>
}
```

### 5.2 Admin Order Controller

```typescript
@Controller('admin/orders')
@ApiTags('admin-orders')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminOrderController {
  
  @Get()
  @ApiOperation({ summary: 'Get all orders with advanced filtering' })
  async getAllOrders(@Query() queryDto: AdminOrderQueryDto): Promise<PaginatedOrderDto>

  @Put(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  async updateOrderStatus(@Param('id') id: string, @Body() statusDto: UpdateOrderStatusDto): Promise<OrderDto>

  @Put(':id/shipment')
  @ApiOperation({ summary: 'Update shipment information' })
  async updateShipment(@Param('id') id: string, @Body() shipmentDto: ShipmentUpdateDto): Promise<OrderDto>

  @Post(':id/refund')
  @ApiOperation({ summary: 'Process refund for order' })
  async processRefund(@Param('id') id: string, @Body() refundDto: RefundRequestDto): Promise<RefundResultDto>

  @Get('analytics')
  @ApiOperation({ summary: 'Get order analytics' })
  async getOrderAnalytics(@Query() analyticsDto: OrderAnalyticsQueryDto): Promise<OrderAnalyticsDto>

  @Get('export')
  @ApiOperation({ summary: 'Export orders to CSV/Excel' })
  async exportOrders(@Query() exportDto: OrderExportDto, @Res() response: Response): Promise<void>
}
```

## 6. Business Logic

### 6.1 Order Service Core Methods

```typescript
@Injectable()
export class OrderService {
  
  // Order creation
  async createOrderFromCart(cartId: string, orderData: CreateOrderDto): Promise<Order>
  async validateOrderData(orderData: CreateOrderDto): Promise<ValidationResult>
  async calculateOrderTotals(orderItems: OrderItem[], shippingMethod: string): Promise<OrderCalculation>
  async reserveInventory(orderItems: OrderItem[]): Promise<ReservationResult>

  // Order management
  async updateOrderStatus(orderId: string, newStatus: OrderStatus, notes?: string): Promise<Order>
  async cancelOrder(orderId: string, reason: string, refundAmount?: number): Promise<Order>
  async confirmOrder(orderId: string): Promise<Order>

  // Payment processing
  async processPayment(orderId: string, paymentData: PaymentRequestDto): Promise<PaymentResult>
  async handlePaymentCallback(gatewayData: any): Promise<void>
  async processRefund(orderId: string, amount: number, reason: string): Promise<RefundResult>

  // Shipment management
  async createShipment(orderId: string, shipmentData: ShipmentData): Promise<Shipment>
  async updateShipmentStatus(shipmentId: string, status: ShipmentStatus): Promise<Shipment>
  async getTrackingInfo(orderId: string): Promise<TrackingInfo>

  // Order queries
  async getOrdersByUser(userId: string, queryParams: OrderQueryDto): Promise<PaginatedResult<Order>>
  async getOrderById(orderId: string): Promise<Order>
  async getOrderByNumber(orderNumber: string): Promise<Order>

  // Analytics
  async getOrderAnalytics(filters: OrderAnalyticsFilter): Promise<OrderAnalytics>
  async generateOrderReport(reportType: string, filters: any): Promise<OrderReport>
}
```

### 6.2 Payment Service

```typescript
@Injectable()
export class PaymentService {
  
  async processStripePayment(order: Order, paymentData: StripePaymentData): Promise<PaymentResult>
  async processPayPalPayment(order: Order, paymentData: PayPalPaymentData): Promise<PaymentResult>
  async processCODPayment(order: Order): Promise<PaymentResult>
  
  async handleWebhook(gateway: PaymentGateway, webhookData: any): Promise<void>
  async verifyPayment(paymentId: string, gateway: PaymentGateway): Promise<PaymentVerification>
  
  async initiateRefund(payment: OrderPayment, amount: number, reason: string): Promise<RefundResult>
  async getPaymentStatus(paymentId: string, gateway: PaymentGateway): Promise<PaymentStatus>
}
```

### 6.3 Order State Machine

```typescript
@Injectable()
export class OrderStateMachine {
  
  private readonly validTransitions = new Map<OrderStatus, OrderStatus[]>([
    [OrderStatus.PENDING, [OrderStatus.CONFIRMED, OrderStatus.CANCELLED]],
    [OrderStatus.CONFIRMED, [OrderStatus.PROCESSING, OrderStatus.CANCELLED]],
    [OrderStatus.PROCESSING, [OrderStatus.SHIPPED, OrderStatus.CANCELLED]],
    [OrderStatus.SHIPPED, [OrderStatus.DELIVERED, OrderStatus.RETURNED]],
    [OrderStatus.DELIVERED, [OrderStatus.REFUNDED]],
    [OrderStatus.CANCELLED, []],
    [OrderStatus.REFUNDED, []]
  ]);
  
  canTransition(fromStatus: OrderStatus, toStatus: OrderStatus): boolean {
    const allowedTransitions = this.validTransitions.get(fromStatus) || [];
    return allowedTransitions.includes(toStatus);
  }
  
  async executeTransition(order: Order, toStatus: OrderStatus, metadata?: any): Promise<Order> {
    if (!this.canTransition(order.status, toStatus)) {
      throw new InvalidOrderTransitionException(order.status, toStatus);
    }
    
    // Execute pre-transition hooks
    await this.executePreTransitionHooks(order, toStatus, metadata);
    
    // Update order status
    const updatedOrder = await this.orderService.updateOrderStatus(order.id, toStatus);
    
    // Execute post-transition hooks
    await this.executePostTransitionHooks(updatedOrder, metadata);
    
    return updatedOrder;
  }
}
```

## 7. Data Transfer Objects (DTOs)

### 7.1 Order DTOs

```typescript
export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  cartId: string;

  @ValidateNested()
  @Type(() => AddressDto)
  billingAddress: AddressDto;

  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @IsString()
  @IsNotEmpty()
  shippingMethod: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  saveAddresses?: boolean;
}

export class OrderDto {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  
  billingAddress: AddressDto;
  shippingAddress: AddressDto;
  
  items: OrderItemDto[];
  payments: OrderPaymentDto[];
  shipments: OrderShipmentDto[];
  
  orderDate: Date;
  estimatedDeliveryDate?: Date;
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export class OrderItemDto {
  id: string;
  productVariantId: string;
  productName: string;
  variantAttributes: Record<string, any>;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productSku: string;
  productImageUrl: string;
}
```

### 7.2 Payment DTOs

```typescript
export class PaymentRequestDto {
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsString()
  @IsOptional()
  paymentToken?: string;

  @IsObject()
  @IsOptional()
  paymentDetails?: Record<string, any>;

  @IsString()
  @IsOptional()
  returnUrl?: string;

  @IsString()
  @IsOptional()
  cancelUrl?: string;
}

export class PaymentResultDto {
  success: boolean;
  paymentId: string;
  transactionId?: string;
  redirectUrl?: string;
  message: string;
  errorCode?: string;
}
```

## 8. Business Rules

### 8.1 Order Validation Rules

```typescript
export class OrderBusinessRules {
  
  static readonly MIN_ORDER_AMOUNT = 10000; // 10,000 VND
  static readonly MAX_ORDER_AMOUNT = 100000000; // 100M VND
  static readonly ORDER_CANCEL_TIME_LIMIT = 24; // 24 hours
  
  static validateOrderAmount(amount: number): ValidationResult {
    if (amount < this.MIN_ORDER_AMOUNT) {
      throw new OrderValidationException(`Minimum order amount is ${this.MIN_ORDER_AMOUNT} VND`);
    }
    
    if (amount > this.MAX_ORDER_AMOUNT) {
      throw new OrderValidationException(`Maximum order amount is ${this.MAX_ORDER_AMOUNT} VND`);
    }
    
    return { valid: true };
  }
  
  static canCancelOrder(order: Order): boolean {
    // Cannot cancel if already shipped or delivered
    if ([OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(order.status)) {
      return false;
    }
    
    // Cannot cancel if order is older than time limit
    const hoursSinceOrder = (Date.now() - order.orderDate.getTime()) / (1000 * 60 * 60);
    if (hoursSinceOrder > this.ORDER_CANCEL_TIME_LIMIT) {
      return false;
    }
    
    return true;
  }
  
  static canRefundOrder(order: Order): boolean {
    return [OrderStatus.DELIVERED, OrderStatus.CANCELLED].includes(order.status);
  }
}
```

### 8.2 Inventory Management

```typescript
@Injectable()
export class OrderInventoryService {
  
  async reserveOrderItems(orderItems: OrderItem[]): Promise<ReservationResult> {
    const reservations: string[] = [];
    const failures: InventoryFailure[] = [];
    
    for (const item of orderItems) {
      try {
        const reservationId = await this.inventoryService.reserveStock(
          item.productVariantId,
          item.quantity
        );
        reservations.push(reservationId);
      } catch (error) {
        failures.push({
          productVariantId: item.productVariantId,
          requestedQuantity: item.quantity,
          error: error.message
        });
      }
    }
    
    if (failures.length > 0) {
      // Release successful reservations
      await this.releaseReservations(reservations);
      throw new InsufficientInventoryException(failures);
    }
    
    return { reservationIds: reservations };
  }
  
  async commitReservations(reservationIds: string[]): Promise<void> {
    for (const reservationId of reservationIds) {
      await this.inventoryService.commitReservation(reservationId);
    }
  }
  
  async releaseReservations(reservationIds: string[]): Promise<void> {
    for (const reservationId of reservationIds) {
      await this.inventoryService.releaseReservation(reservationId);
    }
  }
}
```

## 9. Queue Processing

### 9.1 Order Processing Queue

```typescript
@Processor('order-processing')
export class OrderProcessor {
  
  @Process('process-order')
  async processOrder(job: Job<ProcessOrderData>): Promise<void> {
    const { orderId } = job.data;
    
    try {
      // 1. Validate order
      const order = await this.orderService.getOrderById(orderId);
      
      // 2. Process payment
      if (order.payments.length === 0) {
        throw new Error('No payment information found');
      }
      
      // 3. Reserve inventory
      await this.inventoryService.reserveOrderItems(order.items);
      
      // 4. Update order status
      await this.orderService.updateOrderStatus(orderId, OrderStatus.CONFIRMED);
      
      // 5. Send confirmation email
      await this.emailService.sendOrderConfirmation(order);
      
      // 6. Create shipment if auto-fulfillment enabled
      if (this.configService.get('AUTO_FULFILLMENT_ENABLED')) {
        await this.shipmentService.createShipment(orderId);
      }
      
    } catch (error) {
      await this.orderService.updateOrderStatus(orderId, OrderStatus.CANCELLED);
      throw error;
    }
  }
  
  @Process('payment-retry')
  async retryPayment(job: Job<PaymentRetryData>): Promise<void> {
    const { paymentId, attempt } = job.data;
    
    if (attempt > 3) {
      await this.handlePaymentFailure(paymentId);
      return;
    }
    
    try {
      await this.paymentService.retryPayment(paymentId);
    } catch (error) {
      // Schedule another retry
      await this.orderQueue.add('payment-retry', {
        paymentId,
        attempt: attempt + 1
      }, {
        delay: Math.pow(2, attempt) * 60000 // Exponential backoff
      });
    }
  }
}
```

## 10. Event System

### 10.1 Order Events

```typescript
export class OrderEventService {
  
  @OnEvent('order.created')
  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    // Send order confirmation email
    await this.emailService.sendOrderConfirmation(event.order);
    
    // Update user statistics
    await this.userService.updateOrderStats(event.order.userId);
    
    // Trigger inventory reservation
    await this.orderQueue.add('process-order', { orderId: event.order.id });
  }
  
  @OnEvent('order.paid')
  async handleOrderPaid(event: OrderPaidEvent): Promise<void> {
    // Confirm inventory reservations
    await this.inventoryService.commitOrderReservations(event.order.id);
    
    // Update order status
    await this.orderService.updateOrderStatus(event.order.id, OrderStatus.PROCESSING);
    
    // Send payment confirmation
    await this.emailService.sendPaymentConfirmation(event.order);
  }
  
  @OnEvent('order.shipped')
  async handleOrderShipped(event: OrderShippedEvent): Promise<void> {
    // Send shipping notification
    await this.emailService.sendShippingNotification(event.order, event.trackingNumber);
    
    // Schedule delivery reminder
    await this.scheduleDeliveryReminder(event.order.id);
  }
  
  @OnEvent('order.cancelled')
  async handleOrderCancelled(event: OrderCancelledEvent): Promise<void> {
    // Release inventory reservations
    await this.inventoryService.releaseOrderReservations(event.order.id);
    
    // Process refund if payment was made
    if (event.order.payments.some(p => p.status === PaymentStatus.COMPLETED)) {
      await this.paymentService.processRefund(event.order.id, event.refundAmount);
    }
    
    // Send cancellation notification
    await this.emailService.sendOrderCancellation(event.order);
  }
}
```

## 11. Security & Authorization

### 11.1 Order Access Control

```typescript
@Injectable()
export class OrderAccessGuard implements CanActivate {
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const orderId = request.params.id;
    
    const order = await this.orderService.getOrderById(orderId);
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    
    // Users can only access their own orders
    if (order.userId !== user.id) {
      // Allow admin access
      if (user.role === UserRole.ADMIN) {
        return true;
      }
      throw new ForbiddenException('Access denied to this order');
    }
    
    return true;
  }
}
```

### 11.2 Payment Security

```typescript
@Injectable()
export class PaymentSecurityService {
  
  validateWebhookSignature(payload: string, signature: string, gateway: PaymentGateway): boolean {
    switch (gateway) {
      case PaymentGateway.STRIPE:
        return this.validateStripeSignature(payload, signature);
      case PaymentGateway.PAYPAL:
        return this.validatePayPalSignature(payload, signature);
      default:
        return false;
    }
  }
  
  encryptPaymentData(paymentData: any): string {
    return this.cryptoService.encrypt(JSON.stringify(paymentData));
  }
  
  decryptPaymentData(encryptedData: string): any {
    const decrypted = this.cryptoService.decrypt(encryptedData);
    return JSON.parse(decrypted);
  }
  
  maskSensitiveData(paymentData: any): any {
    return {
      ...paymentData,
      cardNumber: paymentData.cardNumber ? `****-****-****-${paymentData.cardNumber.slice(-4)}` : undefined,
      cvv: undefined,
      bankAccount: paymentData.bankAccount ? `***${paymentData.bankAccount.slice(-4)}` : undefined
    };
  }
}
```

## 12. Error Handling

### 12.1 Custom Exceptions

```typescript
export class OrderValidationException extends BaseException {
  constructor(message: string) {
    super(message, 400);
  }
}

export class InvalidOrderTransitionException extends BaseException {
  constructor(fromStatus: OrderStatus, toStatus: OrderStatus) {
    super(`Invalid order status transition from ${fromStatus} to ${toStatus}`, 400);
  }
}

export class InsufficientInventoryException extends BaseException {
  constructor(failures: InventoryFailure[]) {
    super('Insufficient inventory for order items', 400, { failures });
  }
}

export class PaymentProcessingException extends BaseException {
  constructor(message: string, paymentId?: string) {
    super(message, 402, { paymentId });
  }
}

export class OrderNotFoundException extends BaseException {
  constructor(orderId: string) {
    super(`Order with ID ${orderId} not found`, 404);
  }
}
```

## 13. Performance Optimization

### 13.1 Database Optimization

- Use database transactions for order creation
- Implement efficient pagination for order listings
- Use read replicas for order analytics
- Index optimization for frequent queries

### 13.2 Caching Strategy

```typescript
@Injectable()
export class OrderCacheService {
  
  private readonly ORDER_CACHE_TTL = 1800; // 30 minutes
  
  async cacheOrder(orderId: string, order: OrderDto): Promise<void> {
    const cacheKey = `order:${orderId}`;
    await this.cacheManager.set(cacheKey, order, this.ORDER_CACHE_TTL);
  }
  
  async getCachedOrder(orderId: string): Promise<OrderDto | null> {
    const cacheKey = `order:${orderId}`;
    return await this.cacheManager.get(cacheKey);
  }
  
  async invalidateOrderCache(orderId: string): Promise<void> {
    const cacheKey = `order:${orderId}`;
    await this.cacheManager.del(cacheKey);
    
    // Also invalidate user's order list cache
    const userOrdersKey = `user:orders:*`;
    await this.cacheManager.del(userOrdersKey);
  }
}
```

## 14. Monitoring & Analytics

### 14.1 Key Metrics

- Order conversion rate
- Average order value
- Payment success rate
- Order fulfillment time
- Return/refund rate

### 14.2 Order Analytics Service

```typescript
@Injectable()
export class OrderAnalyticsService {
  
  async getOrderMetrics(dateRange: DateRange): Promise<OrderMetrics> {
    const orders = await this.orderService.getOrdersInRange(dateRange);
    
    return {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
      averageOrderValue: orders.length > 0 ? 
        orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length : 0,
      conversionRate: await this.calculateConversionRate(dateRange),
      topProducts: await this.getTopSellingProducts(dateRange),
      ordersByStatus: this.groupOrdersByStatus(orders),
      paymentMethodDistribution: this.getPaymentMethodDistribution(orders)
    };
  }
  
  async generateSalesReport(reportType: ReportType, filters: ReportFilters): Promise<SalesReport> {
    switch (reportType) {
      case ReportType.DAILY:
        return this.generateDailySalesReport(filters);
      case ReportType.WEEKLY:
        return this.generateWeeklySalesReport(filters);
      case ReportType.MONTHLY:
        return this.generateMonthlySalesReport(filters);
      default:
        throw new Error('Unsupported report type');
    }
  }
}
```

## 15. Testing Strategy

### 15.1 Unit Tests

- Order service business logic
- Payment processing
- Order state transitions
- Validation rules
- Calculation accuracy

### 15.2 Integration Tests

- Order creation flow
- Payment gateway integration
- Database transactions
- Event handling
- Queue processing

### 15.3 E2E Tests

- Complete order workflow
- Payment processing flows
- Order status updates
- Cancellation and refund processes

## 16. Future Enhancements

- Multi-currency support
- Subscription orders
- Order scheduling
- Advanced analytics dashboard
- Machine learning for fraud detection
- Integration with more payment gateways
- Split payments functionality
