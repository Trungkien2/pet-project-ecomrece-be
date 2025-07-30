# Technical Design Document - Customer Management Module (BE.03)

## 1. Thông tin tài liệu

- **Module**: Customer Management (BE.03)
- **Phiên bản**: 1.0
- **Ngày tạo**: 27/07/2025
- **Người viết**: Development Team
- **SRS Reference**: BE.03 - Quản lý Khách hàng

## 2. Tổng quan module

Module Customer Management cung cấp đầy đủ công cụ quản lý khách hàng cho Admin và Nhân viên, bao gồm xem thông tin, phân tích hành vi mua hàng và quản lý trạng thái tài khoản.

### 2.1 Chức năng chính

- **BE.03.1**: Xem danh sách khách hàng với bộ lọc nâng cao
- **BE.03.2**: Xem thông tin chi tiết khách hàng
- **BE.03.3**: Kích hoạt/Vô hiệu hóa tài khoản khách hàng
- **BE.03.4**: Phân tích hành vi và lịch sử mua hàng
- **BE.03.5**: Xuất báo cáo khách hàng
- **BE.03.6**: Quản lý ghi chú nội bộ

## 3. Kiến trúc module

### 3.1 Cấu trúc thư mục

```
src/customer/
├── customer.controller.ts
├── customer.service.ts
├── customer.module.ts
├── entities/
│   ├── customer-note.entity.ts
│   ├── customer-analytics.entity.ts
│   └── customer-segment.entity.ts
├── dto/
│   ├── customer-query.dto.ts
│   ├── customer-detail.dto.ts
│   ├── customer-note.dto.ts
│   ├── customer-analytics.dto.ts
│   └── customer-export.dto.ts
├── services/
│   ├── customer-analytics.service.ts
│   ├── customer-segmentation.service.ts
│   └── customer-export.service.ts
├── interfaces/
│   ├── customer.interface.ts
│   ├── customer-behavior.interface.ts
│   └── customer-metrics.interface.ts
├── enums/
│   ├── customer-status.enum.ts
│   ├── customer-segment.enum.ts
│   └── customer-lifecycle.enum.ts
└── customer.providers.ts
```

### 3.2 Dependencies

- `@nestjs/common`: Controllers, Services
- `sequelize-typescript`: ORM entities
- `@nestjs/bull`: Background processing for analytics
- `@nestjs/schedule`: Scheduled tasks for customer insights
- `xlsx`: Excel export functionality
- `@nestjs/cache-manager`: Customer data caching

## 4. Database Design

### 4.1 Customer Note Entity

```sql
CREATE TABLE tbl_customer_note (
  id VARCHAR(36) PRIMARY KEY,
  customer_id VARCHAR(36) NOT NULL,
  author_id VARCHAR(36) NOT NULL,
  title VARCHAR(255),
  content TEXT NOT NULL,
  type ENUM('general', 'support', 'sales', 'complaint', 'feedback') DEFAULT 'general',
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  is_internal BOOLEAN DEFAULT TRUE,
  tags JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (customer_id) REFERENCES tbl_user(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES tbl_user(id),
  INDEX idx_customer_id (customer_id),
  INDEX idx_author_id (author_id),
  INDEX idx_type (type),
  INDEX idx_priority (priority),
  INDEX idx_created_at (created_at)
);
```

### 4.2 Customer Analytics Entity

```sql
CREATE TABLE tbl_customer_analytics (
  id VARCHAR(36) PRIMARY KEY,
  customer_id VARCHAR(36) NOT NULL,
  
  -- Order Statistics
  total_orders INT DEFAULT 0,
  total_spent DECIMAL(15,2) DEFAULT 0,
  average_order_value DECIMAL(10,2) DEFAULT 0,
  last_order_date DATETIME NULL,
  days_since_last_order INT NULL,
  
  -- Behavior Metrics
  total_sessions INT DEFAULT 0,
  total_page_views INT DEFAULT 0,
  average_session_duration INT DEFAULT 0, -- seconds
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Product Preferences
  favorite_categories JSON,
  favorite_brands JSON,
  preferred_price_range JSON,
  
  -- Lifecycle Metrics
  customer_lifetime_value DECIMAL(15,2) DEFAULT 0,
  predicted_ltv DECIMAL(15,2) DEFAULT 0,
  churn_risk_score DECIMAL(3,2) DEFAULT 0, -- 0-1 scale
  engagement_score DECIMAL(3,2) DEFAULT 0, -- 0-1 scale
  
  -- Segmentation
  segment ENUM('new', 'active', 'loyal', 'at_risk', 'churned', 'vip') DEFAULT 'new',
  rfm_score VARCHAR(3), -- Recency, Frequency, Monetary score
  
  -- Timestamps
  last_calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (customer_id) REFERENCES tbl_user(id) ON DELETE CASCADE,
  UNIQUE KEY unique_customer_analytics (customer_id),
  INDEX idx_segment (segment),
  INDEX idx_total_spent (total_spent),
  INDEX idx_churn_risk_score (churn_risk_score),
  INDEX idx_last_order_date (last_order_date)
);
```

### 4.3 Customer Segment Entity

```sql
CREATE TABLE tbl_customer_segment (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  criteria JSON NOT NULL, -- Segmentation rules
  color_code VARCHAR(7), -- Hex color for UI
  is_active BOOLEAN DEFAULT TRUE,
  auto_assign BOOLEAN DEFAULT TRUE,
  customer_count INT DEFAULT 0,
  created_by VARCHAR(36),
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (created_by) REFERENCES tbl_user(id),
  INDEX idx_name (name),
  INDEX idx_is_active (is_active)
);
```

### 4.4 Customer Segment Assignment Entity

```sql
CREATE TABLE tbl_customer_segment_assignment (
  id VARCHAR(36) PRIMARY KEY,
  customer_id VARCHAR(36) NOT NULL,
  segment_id VARCHAR(36) NOT NULL,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  assigned_by ENUM('system', 'manual') DEFAULT 'system',
  expires_at DATETIME NULL,
  
  FOREIGN KEY (customer_id) REFERENCES tbl_user(id) ON DELETE CASCADE,
  FOREIGN KEY (segment_id) REFERENCES tbl_customer_segment(id) ON DELETE CASCADE,
  UNIQUE KEY unique_customer_segment (customer_id, segment_id),
  INDEX idx_customer_id (customer_id),
  INDEX idx_segment_id (segment_id),
  INDEX idx_assigned_at (assigned_at)
);
```

## 5. API Endpoints

### 5.1 Customer Controller

```typescript
@Controller('admin/customers')
@ApiTags('admin-customers')
@UseGuards(JwtAuthGuard, AdminGuard)
export class CustomerController {
  
  @Get()
  @ApiOperation({ summary: 'Get customers with advanced filtering' })
  async getCustomers(@Query() queryDto: CustomerQueryDto): Promise<PaginatedCustomerDto>

  @Get(':id')
  @ApiOperation({ summary: 'Get customer details' })
  async getCustomer(@Param('id') id: string): Promise<CustomerDetailDto>

  @Put(':id/status')
  @ApiOperation({ summary: 'Update customer account status' })
  async updateCustomerStatus(@Param('id') id: string, @Body() statusDto: UpdateCustomerStatusDto): Promise<CustomerDto>

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get customer analytics and insights' })
  async getCustomerAnalytics(@Param('id') id: string): Promise<CustomerAnalyticsDto>

  @Get(':id/orders')
  @ApiOperation({ summary: 'Get customer order history' })
  async getCustomerOrders(@Param('id') id: string, @Query() queryDto: OrderQueryDto): Promise<PaginatedOrderDto>

  @Post(':id/notes')
  @ApiOperation({ summary: 'Add note to customer' })
  async addCustomerNote(@Param('id') id: string, @Body() noteDto: CreateCustomerNoteDto): Promise<CustomerNoteDto>

  @Get(':id/notes')
  @ApiOperation({ summary: 'Get customer notes' })
  async getCustomerNotes(@Param('id') id: string, @Query() queryDto: NoteQueryDto): Promise<PaginatedNoteDto>

  @Put('notes/:noteId')
  @ApiOperation({ summary: 'Update customer note' })
  async updateCustomerNote(@Param('noteId') noteId: string, @Body() noteDto: UpdateCustomerNoteDto): Promise<CustomerNoteDto>

  @Delete('notes/:noteId')
  @ApiOperation({ summary: 'Delete customer note' })
  async deleteCustomerNote(@Param('noteId') noteId: string): Promise<void>

  @Get('segments')
  @ApiOperation({ summary: 'Get customer segments' })
  async getCustomerSegments(): Promise<CustomerSegmentDto[]>

  @Post('segments')
  @ApiOperation({ summary: 'Create customer segment' })
  async createCustomerSegment(@Body() segmentDto: CreateCustomerSegmentDto): Promise<CustomerSegmentDto>

  @Put(':id/segments')
  @ApiOperation({ summary: 'Assign customer to segments' })
  async assignCustomerSegments(@Param('id') id: string, @Body() segmentsDto: AssignSegmentsDto): Promise<void>

  @Get('export')
  @ApiOperation({ summary: 'Export customer data' })
  async exportCustomers(@Query() exportDto: CustomerExportDto, @Res() response: Response): Promise<void>

  @Get('analytics/overview')
  @ApiOperation({ summary: 'Get customer analytics overview' })
  async getCustomerOverview(@Query() queryDto: AnalyticsQueryDto): Promise<CustomerOverviewDto>
}
```

## 6. Business Logic

### 6.1 Customer Service Core Methods

```typescript
@Injectable()
export class CustomerService {
  
  // Customer management
  async getCustomers(queryDto: CustomerQueryDto): Promise<PaginatedResult<Customer>>
  async getCustomerById(customerId: string): Promise<CustomerDetail>
  async updateCustomerStatus(customerId: string, status: CustomerStatus): Promise<Customer>
  async getCustomerAnalytics(customerId: string): Promise<CustomerAnalytics>

  // Customer insights
  async calculateCustomerMetrics(customerId: string): Promise<CustomerMetrics>
  async getCustomerLifetimeValue(customerId: string): Promise<number>
  async calculateChurnRisk(customerId: string): Promise<number>
  async getCustomerEngagementScore(customerId: string): Promise<number>

  // Customer notes
  async addCustomerNote(customerId: string, noteData: CreateCustomerNoteDto): Promise<CustomerNote>
  async getCustomerNotes(customerId: string, queryDto: NoteQueryDto): Promise<PaginatedResult<CustomerNote>>
  async updateCustomerNote(noteId: string, updateData: UpdateCustomerNoteDto): Promise<CustomerNote>
  async deleteCustomerNote(noteId: string): Promise<void>

  // Customer segmentation
  async assignCustomerToSegments(customerId: string, segmentIds: string[]): Promise<void>
  async getCustomerSegments(customerId: string): Promise<CustomerSegment[]>
  async removeCustomerFromSegment(customerId: string, segmentId: string): Promise<void>

  // Customer export
  async exportCustomers(exportDto: CustomerExportDto): Promise<Buffer>
  async getCustomerExportData(filters: CustomerFilters): Promise<CustomerExportData[]>

  // Customer search and filtering
  async searchCustomers(searchTerm: string, filters?: CustomerFilters): Promise<Customer[]>
  async getCustomersBySegment(segmentId: string): Promise<Customer[]>
  async getCustomersAtRisk(): Promise<Customer[]>
}
```

### 6.2 Customer Analytics Service

```typescript
@Injectable()
export class CustomerAnalyticsService {
  
  async calculateCustomerAnalytics(customerId: string): Promise<CustomerAnalytics> {
    const customer = await this.customerService.getCustomerById(customerId);
    const orders = await this.orderService.getOrdersByCustomer(customerId);
    const sessions = await this.sessionService.getCustomerSessions(customerId);
    
    return {
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, order) => sum + order.totalAmount, 0),
      averageOrderValue: orders.length > 0 ? 
        orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length : 0,
      lastOrderDate: orders.length > 0 ? orders[0].orderDate : null,
      daysSinceLastOrder: this.calculateDaysSinceLastOrder(orders),
      
      totalSessions: sessions.length,
      averageSessionDuration: this.calculateAverageSessionDuration(sessions),
      bounceRate: this.calculateBounceRate(sessions),
      conversionRate: this.calculateConversionRate(sessions, orders),
      
      favoriteCategories: this.getFavoriteCategories(orders),
      favoriteBrands: this.getFavoriteBrands(orders),
      preferredPriceRange: this.getPreferredPriceRange(orders),
      
      customerLifetimeValue: this.calculateLTV(orders),
      predictedLtv: await this.predictLTV(customerId),
      churnRiskScore: await this.calculateChurnRisk(customerId),
      engagementScore: this.calculateEngagementScore(sessions, orders),
      
      segment: this.determineCustomerSegment(customerId),
      rfmScore: this.calculateRFMScore(orders)
    };
  }
  
  async calculateChurnRisk(customerId: string): Promise<number> {
    const analytics = await this.getCustomerAnalytics(customerId);
    const industry_benchmarks = await this.getIndustryBenchmarks();
    
    let riskScore = 0;
    
    // Recency factor
    if (analytics.daysSinceLastOrder > 90) riskScore += 0.3;
    else if (analytics.daysSinceLastOrder > 60) riskScore += 0.2;
    else if (analytics.daysSinceLastOrder > 30) riskScore += 0.1;
    
    // Frequency factor
    if (analytics.totalOrders < 2) riskScore += 0.2;
    
    // Engagement factor
    if (analytics.engagementScore < 0.3) riskScore += 0.3;
    else if (analytics.engagementScore < 0.5) riskScore += 0.2;
    
    // Session behavior
    if (analytics.bounceRate > 0.8) riskScore += 0.2;
    
    return Math.min(riskScore, 1);
  }
  
  calculateRFMScore(orders: Order[]): string {
    const recency = this.calculateRecencyScore(orders);
    const frequency = this.calculateFrequencyScore(orders);
    const monetary = this.calculateMonetaryScore(orders);
    
    return `${recency}${frequency}${monetary}`;
  }
  
  async generateCustomerInsights(customerId: string): Promise<CustomerInsight[]> {
    const analytics = await this.getCustomerAnalytics(customerId);
    const insights: CustomerInsight[] = [];
    
    // High value customer
    if (analytics.totalSpent > 10000000) { // 10M VND
      insights.push({
        type: 'high_value',
        title: 'High Value Customer',
        description: 'This customer has high lifetime value',
        priority: 'high',
        actionRecommendation: 'Consider VIP treatment and exclusive offers'
      });
    }
    
    // At risk customer
    if (analytics.churnRiskScore > 0.7) {
      insights.push({
        type: 'churn_risk',
        title: 'High Churn Risk',
        description: 'Customer shows signs of potential churn',
        priority: 'critical',
        actionRecommendation: 'Reach out with retention campaign'
      });
    }
    
    // Loyal customer
    if (analytics.totalOrders > 5 && analytics.daysSinceLastOrder < 30) {
      insights.push({
        type: 'loyal',
        title: 'Loyal Customer',
        description: 'Consistent purchase behavior',
        priority: 'medium',
        actionRecommendation: 'Offer loyalty rewards program'
      });
    }
    
    return insights;
  }
}
```

### 6.3 Customer Segmentation Service

```typescript
@Injectable()
export class CustomerSegmentationService {
  
  async createSegment(segmentData: CreateCustomerSegmentDto): Promise<CustomerSegment> {
    const segment = await this.customerSegmentRepository.create(segmentData);
    
    if (segment.autoAssign) {
      await this.assignCustomersToSegment(segment.id);
    }
    
    return segment;
  }
  
  async assignCustomersToSegment(segmentId: string): Promise<void> {
    const segment = await this.getSegmentById(segmentId);
    const eligibleCustomers = await this.findEligibleCustomers(segment.criteria);
    
    for (const customer of eligibleCustomers) {
      await this.assignCustomerToSegment(customer.id, segmentId, 'system');
    }
    
    await this.updateSegmentCustomerCount(segmentId, eligibleCustomers.length);
  }
  
  private async findEligibleCustomers(criteria: SegmentCriteria): Promise<Customer[]> {
    const queryBuilder = this.customerRepository.createQueryBuilder('customer')
      .leftJoinAndSelect('customer.analytics', 'analytics')
      .leftJoinAndSelect('customer.orders', 'orders');
    
    // Apply segmentation criteria
    if (criteria.totalSpentMin) {
      queryBuilder.andWhere('analytics.total_spent >= :totalSpentMin', { 
        totalSpentMin: criteria.totalSpentMin 
      });
    }
    
    if (criteria.totalSpentMax) {
      queryBuilder.andWhere('analytics.total_spent <= :totalSpentMax', { 
        totalSpentMax: criteria.totalSpentMax 
      });
    }
    
    if (criteria.totalOrdersMin) {
      queryBuilder.andWhere('analytics.total_orders >= :totalOrdersMin', { 
        totalOrdersMin: criteria.totalOrdersMin 
      });
    }
    
    if (criteria.daysSinceLastOrderMax) {
      queryBuilder.andWhere('analytics.days_since_last_order <= :daysSinceLastOrderMax', { 
        daysSinceLastOrderMax: criteria.daysSinceLastOrderMax 
      });
    }
    
    if (criteria.churnRiskMin || criteria.churnRiskMax) {
      if (criteria.churnRiskMin) {
        queryBuilder.andWhere('analytics.churn_risk_score >= :churnRiskMin', { 
          churnRiskMin: criteria.churnRiskMin 
        });
      }
      if (criteria.churnRiskMax) {
        queryBuilder.andWhere('analytics.churn_risk_score <= :churnRiskMax', { 
          churnRiskMax: criteria.churnRiskMax 
        });
      }
    }
    
    return await queryBuilder.getMany();
  }
  
  async getSegmentInsights(segmentId: string): Promise<SegmentInsights> {
    const customers = await this.getCustomersBySegment(segmentId);
    const analytics = await this.calculateSegmentAnalytics(customers);
    
    return {
      customerCount: customers.length,
      averageLTV: analytics.averageLTV,
      averageOrderValue: analytics.averageOrderValue,
      totalRevenue: analytics.totalRevenue,
      churnRate: analytics.churnRate,
      engagementRate: analytics.engagementRate,
      topCategories: analytics.topCategories,
      ageDistribution: analytics.ageDistribution,
      geographicDistribution: analytics.geographicDistribution
    };
  }
}
```

## 7. Data Transfer Objects (DTOs)

### 7.1 Customer DTOs

```typescript
export class CustomerQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;

  @IsOptional()
  @IsEnum(CustomerSegment)
  segment?: CustomerSegment;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  registeredAfter?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  registeredBefore?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minTotalSpent?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxTotalSpent?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minOrders?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxDaysSinceLastOrder?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class CustomerDetailDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  status: CustomerStatus;
  emailVerifiedAt?: Date;
  phoneVerifiedAt?: Date;
  avatarUrl?: string;
  
  // Profile information
  dateOfBirth?: Date;
  gender?: string;
  
  // Address information
  addresses: AddressDto[];
  defaultShippingAddress?: AddressDto;
  defaultBillingAddress?: AddressDto;
  
  // Analytics summary
  analytics: CustomerAnalyticsDto;
  
  // Segments
  segments: CustomerSegmentDto[];
  
  // Recent activity
  recentOrders: OrderSummaryDto[];
  recentNotes: CustomerNoteDto[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export class CustomerAnalyticsDto {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: Date;
  daysSinceLastOrder?: number;
  
  totalSessions: number;
  averageSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  
  favoriteCategories: CategorySummary[];
  favoriteBrands: BrandSummary[];
  preferredPriceRange: PriceRange;
  
  customerLifetimeValue: number;
  predictedLtv: number;
  churnRiskScore: number;
  engagementScore: number;
  
  segment: CustomerSegment;
  rfmScore: string;
  
  insights: CustomerInsight[];
}
```

### 7.2 Customer Note DTOs

```typescript
export class CreateCustomerNoteDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string;

  @IsEnum(CustomerNoteType)
  type: CustomerNoteType;

  @IsEnum(NotePriority)
  priority: NotePriority;

  @IsBoolean()
  @IsOptional()
  isInternal?: boolean = true;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class CustomerNoteDto {
  id: string;
  customerId: string;
  authorId: string;
  authorName: string;
  title?: string;
  content: string;
  type: CustomerNoteType;
  priority: NotePriority;
  isInternal: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 7.3 Segmentation DTOs

```typescript
export class CreateCustomerSegmentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsObject()
  criteria: SegmentCriteria;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i)
  colorCode?: string;

  @IsBoolean()
  @IsOptional()
  autoAssign?: boolean = true;
}

export interface SegmentCriteria {
  totalSpentMin?: number;
  totalSpentMax?: number;
  totalOrdersMin?: number;
  totalOrdersMax?: number;
  daysSinceLastOrderMin?: number;
  daysSinceLastOrderMax?: number;
  churnRiskMin?: number;
  churnRiskMax?: number;
  engagementScoreMin?: number;
  engagementScoreMax?: number;
  registeredAfter?: Date;
  registeredBefore?: Date;
  preferredCategories?: string[];
  geographicRegions?: string[];
}
```

## 8. Business Rules

### 8.1 Customer Status Management

```typescript
export class CustomerBusinessRules {
  
  static readonly CHURN_RISK_THRESHOLDS = {
    LOW: 0.3,
    MEDIUM: 0.6,
    HIGH: 0.8
  };
  
  static readonly ENGAGEMENT_SCORE_WEIGHTS = {
    RECENCY: 0.3,
    FREQUENCY: 0.3,
    MONETARY: 0.2,
    SESSION_BEHAVIOR: 0.2
  };
  
  static canDeactivateCustomer(customer: Customer): ValidationResult {
    // Cannot deactivate if customer has pending orders
    if (customer.orders.some(order => ['pending', 'processing'].includes(order.status))) {
      throw new CustomerValidationException('Cannot deactivate customer with pending orders');
    }
    
    // Cannot deactivate if customer has recent activity (last 24 hours)
    const daysSinceLastActivity = (Date.now() - customer.lastLoginAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastActivity < 1) {
      throw new CustomerValidationException('Cannot deactivate customer with recent activity');
    }
    
    return { valid: true };
  }
  
  static calculateCustomerSegment(analytics: CustomerAnalytics): CustomerSegment {
    // VIP customers: High spending + Low churn risk
    if (analytics.totalSpent > 50000000 && analytics.churnRiskScore < 0.3) {
      return CustomerSegment.VIP;
    }
    
    // Loyal customers: Multiple orders + Regular activity
    if (analytics.totalOrders > 5 && analytics.daysSinceLastOrder < 60) {
      return CustomerSegment.LOYAL;
    }
    
    // At risk customers: High churn risk
    if (analytics.churnRiskScore > 0.7) {
      return CustomerSegment.AT_RISK;
    }
    
    // Active customers: Recent activity
    if (analytics.daysSinceLastOrder < 30) {
      return CustomerSegment.ACTIVE;
    }
    
    // Churned customers: No activity for long time
    if (analytics.daysSinceLastOrder > 180) {
      return CustomerSegment.CHURNED;
    }
    
    // New customers: First order recent
    if (analytics.totalOrders <= 1) {
      return CustomerSegment.NEW;
    }
    
    return CustomerSegment.ACTIVE;
  }
}
```

## 9. Background Processing

### 9.1 Customer Analytics Processor

```typescript
@Processor('customer-analytics')
export class CustomerAnalyticsProcessor {
  
  @Process('calculate-customer-analytics')
  async calculateCustomerAnalytics(job: Job<{ customerId: string }>): Promise<void> {
    const { customerId } = job.data;
    
    try {
      const analytics = await this.customerAnalyticsService.calculateCustomerAnalytics(customerId);
      await this.customerAnalyticsService.saveCustomerAnalytics(customerId, analytics);
      
      // Update customer segment
      const newSegment = CustomerBusinessRules.calculateCustomerSegment(analytics);
      await this.customerSegmentationService.updateCustomerSegment(customerId, newSegment);
      
      // Generate insights
      const insights = await this.customerAnalyticsService.generateCustomerInsights(customerId);
      await this.customerInsightService.saveCustomerInsights(customerId, insights);
      
    } catch (error) {
      this.logger.error(`Failed to calculate analytics for customer ${customerId}`, error);
      throw error;
    }
  }
  
  @Process('batch-analytics-update')
  async batchAnalyticsUpdate(job: Job<{ customerIds: string[] }>): Promise<void> {
    const { customerIds } = job.data;
    
    for (const customerId of customerIds) {
      await this.customerAnalyticsQueue.add('calculate-customer-analytics', 
        { customerId }, 
        { delay: Math.random() * 10000 } // Spread load
      );
    }
  }
  
  @Cron('0 2 * * *') // Daily at 2 AM
  async scheduleDailyAnalyticsUpdate(): Promise<void> {
    const activeCustomers = await this.customerService.getActiveCustomers();
    const customerIds = activeCustomers.map(c => c.id);
    
    // Process in batches of 100
    const batchSize = 100;
    for (let i = 0; i < customerIds.length; i += batchSize) {
      const batch = customerIds.slice(i, i + batchSize);
      await this.customerAnalyticsQueue.add('batch-analytics-update', { customerIds: batch });
    }
  }
}
```

## 10. Event System

### 10.1 Customer Events

```typescript
export class CustomerEventService {
  
  @OnEvent('customer.registered')
  async handleCustomerRegistered(event: CustomerRegisteredEvent): Promise<void> {
    // Initialize customer analytics
    await this.customerAnalyticsService.initializeCustomerAnalytics(event.customer.id);
    
    // Assign to "New" segment
    await this.customerSegmentationService.assignCustomerToSegment(
      event.customer.id, 
      'new-customers'
    );
    
    // Send welcome email
    await this.emailService.sendWelcomeEmail(event.customer);
  }
  
  @OnEvent('order.completed')
  async handleOrderCompleted(event: OrderCompletedEvent): Promise<void> {
    // Update customer analytics
    await this.customerAnalyticsQueue.add('calculate-customer-analytics', {
      customerId: event.order.userId
    });
    
    // Check for segment changes
    await this.customerSegmentationService.reevaluateCustomerSegments(event.order.userId);
  }
  
  @OnEvent('customer.login')
  async handleCustomerLogin(event: CustomerLoginEvent): Promise<void> {
    // Update last login timestamp
    await this.customerService.updateLastLogin(event.customer.id);
    
    // Track session for analytics
    await this.sessionTrackingService.startSession(event.customer.id, event.sessionData);
  }
  
  @OnEvent('customer.churn.detected')
  async handleChurnDetected(event: CustomerChurnDetectedEvent): Promise<void> {
    // Move to at-risk segment
    await this.customerSegmentationService.assignCustomerToSegment(
      event.customer.id, 
      'at-risk-customers'
    );
    
    // Create internal note
    await this.customerService.addCustomerNote(event.customer.id, {
      title: 'Churn Risk Detected',
      content: `Customer shows high churn risk (score: ${event.churnScore})`,
      type: CustomerNoteType.SYSTEM,
      priority: NotePriority.HIGH,
      isInternal: true
    });
    
    // Trigger retention campaign
    await this.marketingService.triggerRetentionCampaign(event.customer.id);
  }
}
```

## 11. Security & Authorization

### 11.1 Customer Data Protection

```typescript
@Injectable()
export class CustomerDataProtectionService {
  
  async anonymizeCustomerData(customerId: string): Promise<void> {
    const customer = await this.customerService.getCustomerById(customerId);
    
    // Anonymize personal information
    await this.customerService.updateCustomer(customerId, {
      fullName: `Anonymous-${customer.id.slice(-8)}`,
      email: `anonymized-${customer.id.slice(-8)}@deleted.com`,
      phoneNumber: null,
      avatarUrl: null,
      dateOfBirth: null
    });
    
    // Remove addresses
    await this.addressService.deleteCustomerAddresses(customerId);
    
    // Anonymize notes
    await this.customerNoteService.anonymizeCustomerNotes(customerId);
    
    // Keep analytics data but remove PII
    await this.customerAnalyticsService.anonymizeAnalytics(customerId);
  }
  
  async exportCustomerData(customerId: string): Promise<CustomerDataExport> {
    const customer = await this.customerService.getCustomerById(customerId);
    const orders = await this.orderService.getOrdersByCustomer(customerId);
    const notes = await this.customerNoteService.getCustomerNotes(customerId);
    const analytics = await this.customerAnalyticsService.getCustomerAnalytics(customerId);
    
    return {
      personalInformation: this.sanitizePersonalData(customer),
      orderHistory: orders.map(order => this.sanitizeOrderData(order)),
      accountActivity: this.sanitizeAccountActivity(customer),
      analyticsData: this.sanitizeAnalyticsData(analytics),
      exportDate: new Date(),
      dataRetentionPolicy: await this.getDataRetentionPolicy()
    };
  }
  
  private sanitizePersonalData(customer: Customer): SanitizedCustomerData {
    return {
      id: customer.id,
      fullName: customer.fullName,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
      registrationDate: customer.createdAt,
      lastLoginDate: customer.lastLoginAt,
      accountStatus: customer.status
    };
  }
}
```

## 12. Performance Optimization

### 12.1 Customer Data Caching

```typescript
@Injectable()
export class CustomerCacheService {
  
  private readonly CUSTOMER_CACHE_TTL = 1800; // 30 minutes
  private readonly ANALYTICS_CACHE_TTL = 3600; // 1 hour
  
  async getCachedCustomer(customerId: string): Promise<CustomerDetailDto | null> {
    const cacheKey = `customer:${customerId}`;
    return await this.cacheManager.get(cacheKey);
  }
  
  async cacheCustomer(customerId: string, customer: CustomerDetailDto): Promise<void> {
    const cacheKey = `customer:${customerId}`;
    await this.cacheManager.set(cacheKey, customer, this.CUSTOMER_CACHE_TTL);
  }
  
  async getCachedCustomerAnalytics(customerId: string): Promise<CustomerAnalyticsDto | null> {
    const cacheKey = `customer:analytics:${customerId}`;
    return await this.cacheManager.get(cacheKey);
  }
  
  async cacheCustomerAnalytics(customerId: string, analytics: CustomerAnalyticsDto): Promise<void> {
    const cacheKey = `customer:analytics:${customerId}`;
    await this.cacheManager.set(cacheKey, analytics, this.ANALYTICS_CACHE_TTL);
  }
  
  async invalidateCustomerCache(customerId: string): Promise<void> {
    const patterns = [
      `customer:${customerId}`,
      `customer:analytics:${customerId}`,
      `customer:segments:${customerId}`,
      `customer:notes:${customerId}*`
    ];
    
    for (const pattern of patterns) {
      await this.cacheManager.del(pattern);
    }
  }
}
```

## 13. Error Handling

### 13.1 Custom Exceptions

```typescript
export class CustomerValidationException extends BaseException {
  constructor(message: string) {
    super(message, 400);
  }
}

export class CustomerNotFoundException extends BaseException {
  constructor(customerId: string) {
    super(`Customer with ID ${customerId} not found`, 404);
  }
}

export class CustomerSegmentException extends BaseException {
  constructor(message: string) {
    super(message, 400);
  }
}

export class CustomerDataProtectionException extends BaseException {
  constructor(message: string) {
    super(message, 403);
  }
}
```

## 14. Monitoring & Analytics

### 14.1 Customer Metrics Dashboard

```typescript
@Injectable()
export class CustomerMetricsService {
  
  async getCustomerOverview(dateRange: DateRange): Promise<CustomerOverview> {
    return {
      totalCustomers: await this.getTotalCustomers(),
      newCustomers: await this.getNewCustomers(dateRange),
      activeCustomers: await this.getActiveCustomers(dateRange),
      churnedCustomers: await this.getChurnedCustomers(dateRange),
      
      segmentDistribution: await this.getSegmentDistribution(),
      lifetimeValueDistribution: await this.getLTVDistribution(),
      churnRiskDistribution: await this.getChurnRiskDistribution(),
      
      topCustomers: await this.getTopCustomersByValue(10),
      atRiskCustomers: await this.getAtRiskCustomers(20),
      
      geographicDistribution: await this.getGeographicDistribution(),
      ageDistribution: await this.getAgeDistribution(),
      
      conversionFunnel: await this.getConversionFunnel(dateRange),
      retentionCohorts: await this.getRetentionCohorts(dateRange)
    };
  }
  
  async generateCustomerHealthScore(): Promise<number> {
    const metrics = await this.getCustomerOverview(this.getLastMonth());
    
    let healthScore = 0;
    
    // New customer acquisition (25%)
    const newCustomerGrowth = metrics.newCustomers / metrics.totalCustomers;
    healthScore += Math.min(newCustomerGrowth * 100, 25);
    
    // Customer retention (30%)
    const retentionRate = 1 - (metrics.churnedCustomers / metrics.totalCustomers);
    healthScore += retentionRate * 30;
    
    // Engagement (25%)
    const engagementRate = metrics.activeCustomers / metrics.totalCustomers;
    healthScore += engagementRate * 25;
    
    // Value distribution (20%)
    const valueScore = await this.calculateValueDistributionScore(metrics);
    healthScore += valueScore * 20;
    
    return Math.round(healthScore);
  }
}
```

## 15. Testing Strategy

### 15.1 Unit Tests

- Customer service business logic
- Analytics calculations
- Segmentation rules
- Data validation

### 15.2 Integration Tests

- Customer API endpoints
- Database operations
- Event handling
- Cache operations

### 15.3 E2E Tests

- Customer management workflows
- Analytics generation
- Data export functionality
- Security and access controls

## 16. Future Enhancements

- Advanced machine learning for churn prediction
- Real-time customer behavior tracking
- Advanced customer journey mapping
- Integration with marketing automation tools
- Customer satisfaction scoring
- Social media sentiment analysis
- Voice of customer analytics
