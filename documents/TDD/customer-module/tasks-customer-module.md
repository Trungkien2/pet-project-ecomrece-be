# Task Checklist: Customer Management Module (BE.03)

**TDD Reference**: `TDD_Customer_Module.md`  
**Estimated Total Effort**: ~80-100 hours  
**SRS Reference**: BE.03 - Quản lý Khách hàng

---

## Phase 1: Database & Entities

### 1.1 Customer Note Entity
- [ ] Task 1.1.1: [DB] Create `CustomerNote` entity in `src/customer/entities/customer-note.entity.ts` with Sequelize decorators
  - Fields: id, customer_id, author_id, title, content, type, priority, is_internal, tags, timestamps
  - Relationships: BelongsTo User (customer, author)
  - Indexes: customer_id, author_id, type, priority
  - **Estimate**: 1 hour

- [ ] Task 1.1.2: [DB] Create migration file `migrations/YYYYMMDDHHMMSS-create-tbl-customer-note.js`
  - Table: `tbl_customer_note`
  - Foreign keys: customer_id → tbl_user, author_id → tbl_user
  - Indexes: idx_customer_id, idx_author_id, idx_type, idx_priority
  - **Estimate**: 30 minutes

### 1.2 Customer Analytics Entity
- [ ] Task 1.2.1: [DB] Create `CustomerAnalytics` entity in `src/customer/entities/customer-analytics.entity.ts`
  - Fields: id, customer_id (unique), order stats, behavior metrics, product preferences, lifecycle metrics, segmentation
  - Relationships: BelongsTo User
  - Indexes: customer_id (unique), segment, total_spent, churn_risk_score, last_order_date
  - **Estimate**: 2 hours

- [ ] Task 1.2.2: [DB] Create migration file `migrations/YYYYMMDDHHMMSS-create-tbl-customer-analytics.js`
  - Table: `tbl_customer_analytics`
  - Unique constraint on customer_id
  - Foreign key: customer_id → tbl_user
  - Indexes for performance
  - **Estimate**: 1 hour

### 1.3 Customer Segment Entity
- [ ] Task 1.3.1: [DB] Create `CustomerSegment` entity in `src/customer/entities/customer-segment.entity.ts`
  - Fields: id, name, description, criteria (JSON), color_code, is_active, auto_assign, customer_count, created_by
  - Relationships: BelongsTo User (creator)
  - Indexes: name, is_active
  - **Estimate**: 1 hour

- [ ] Task 1.3.2: [DB] Create migration file `migrations/YYYYMMDDHHMMSS-create-tbl-customer-segment.js`
  - Table: `tbl_customer_segment`
  - Foreign key: created_by → tbl_user
  - **Estimate**: 30 minutes

### 1.4 Customer Segment Assignment Entity
- [ ] Task 1.4.1: [DB] Create `CustomerSegmentAssignment` entity in `src/customer/entities/customer-segment-assignment.entity.ts`
  - Fields: id, customer_id, segment_id, assigned_at, assigned_by, expires_at
  - Relationships: BelongsTo User, BelongsTo CustomerSegment
  - Unique constraint: (customer_id, segment_id)
  - **Estimate**: 1 hour

- [ ] Task 1.4.2: [DB] Create migration file `migrations/YYYYMMDDHHMMSS-create-tbl-customer-segment-assignment.js`
  - Table: `tbl_customer_segment_assignment`
  - Foreign keys: customer_id → tbl_user, segment_id → tbl_customer_segment
  - Unique constraint
  - **Estimate**: 30 minutes

### 1.5 Run Migrations
- [ ] Task 1.5.1: [DB] Run all migrations: `pnpm sequelize-cli db:migrate`
  - Verify all tables created successfully
  - Check indexes and foreign keys
  - **Estimate**: 15 minutes

---

## Phase 2: Backend - DTOs & Interfaces

### 2.1 Customer DTOs
- [ ] Task 2.1.1: [BE] Create `CustomerQueryDto` in `src/customer/dto/customer-query.dto.ts`
  - Fields: search, status, segment, registeredAfter, registeredBefore, minTotalSpent, maxTotalSpent, minOrders, maxDaysSinceLastOrder, sortBy, sortOrder, page, limit
  - Validation decorators
  - **Estimate**: 1 hour

- [ ] Task 2.1.2: [BE] Create `CustomerDto` in `src/customer/dto/customer.dto.ts`
  - Response DTO for customer listing
  - **Estimate**: 30 minutes

- [ ] Task 2.1.3: [BE] Create `CustomerDetailDto` in `src/customer/dto/customer-detail.dto.ts`
  - Extended DTO with analytics, segments, addresses, orders, notes
  - **Estimate**: 1 hour

- [ ] Task 2.1.4: [BE] Create `UpdateCustomerStatusDto` in `src/customer/dto/update-customer-status.dto.ts`
  - Field: status (enum)
  - Validation
  - **Estimate**: 30 minutes

### 2.2 Customer Note DTOs
- [ ] Task 2.2.1: [BE] Create `CreateCustomerNoteDto` in `src/customer/dto/customer-note.dto.ts`
  - Fields: title, content, type, priority, isInternal, tags
  - Validation decorators
  - **Estimate**: 1 hour

- [ ] Task 2.2.2: [BE] Create `CustomerNoteDto` and `NoteQueryDto` in same file
  - Response DTOs
  - **Estimate**: 30 minutes

### 2.3 Customer Analytics DTOs
- [ ] Task 2.3.1: [BE] Create `CustomerAnalyticsDto` in `src/customer/dto/customer-analytics.dto.ts`
  - All analytics fields mapped from entity
  - **Estimate**: 1 hour

### 2.4 Customer Segment DTOs
- [ ] Task 2.4.1: [BE] Create `CreateCustomerSegmentDto` in `src/customer/dto/customer-segment.dto.ts`
  - Fields: name, description, criteria (JSON), colorCode, isActive, autoAssign
  - Validation for criteria structure
  - **Estimate**: 1.5 hours

- [ ] Task 2.4.2: [BE] Create `CustomerSegmentDto` and `AssignSegmentsDto` in same file
  - Response and assignment DTOs
  - **Estimate**: 30 minutes

### 2.5 Customer Export DTOs
- [ ] Task 2.5.1: [BE] Create `CustomerExportDto` in `src/customer/dto/customer-export.dto.ts`
  - Fields: format, filters, fields
  - Validation
  - **Estimate**: 30 minutes

---

## Phase 3: Backend - Services

### 3.1 Customer Service
- [ ] Task 3.1.1: [BE] Create `CustomerService` in `src/customer/customer.service.ts` extending `CrudService<User>`
  - Constructor with User entity
  - **Estimate**: 30 minutes

- [ ] Task 3.1.2: [BE] Implement `getCustomers(queryDto)` method in CustomerService
  - Build where clause with search, status, date filters
  - Handle analytics filters (join with CustomerAnalytics)
  - Pagination and sorting
  - Map to CustomerDto
  - **Estimate**: 3 hours

- [ ] Task 3.1.3: [BE] Implement `getCustomerById(customerId)` method
  - Include: CustomerAnalytics, CustomerSegmentAssignment, Address, Order (limit 10), CustomerNote (limit 10)
  - Validate customer exists and role is 'customer'
  - Map to CustomerDetailDto
  - **Estimate**: 2 hours

- [ ] Task 3.1.4: [BE] Implement `updateCustomerStatus(customerId, status)` method
  - Validate customer exists
  - Update status
  - **Estimate**: 1 hour

- [ ] Task 3.1.5: [BE] Implement helper methods: `buildAnalyticsWhere()`, `mapToCustomerDto()`, `mapToCustomerDetailDto()`
  - **Estimate**: 2 hours

### 3.2 Customer Analytics Service
- [ ] Task 3.2.1: [BE] Create `CustomerAnalyticsService` in `src/customer/customer-analytics.service.ts`
  - Inject CustomerService, OrderService
  - **Estimate**: 30 minutes

- [ ] Task 3.2.2: [BE] Implement `calculateCustomerAnalytics(customerId)` method
  - Get customer and orders
  - Calculate: totalOrders, totalSpent, averageOrderValue, lastOrderDate, daysSinceLastOrder
  - Call RFM, churn risk, segment calculation
  - Get or create analytics record
  - Update analytics
  - **Estimate**: 3 hours

- [ ] Task 3.2.3: [BE] Implement `calculateRFMScore(orders)` private method
  - Calculate Recency, Frequency, Monetary scores (1-5)
  - Return string format "RFM"
  - **Estimate**: 2 hours

- [ ] Task 3.2.4: [BE] Implement `calculateChurnRisk(customerId, orders, daysSinceLastOrder)` private method
  - Recency factor, frequency factor, engagement factor
  - Return score 0-1
  - **Estimate**: 2 hours

- [ ] Task 3.2.5: [BE] Implement `determineSegment()` private method
  - Logic: at_risk, churned, vip, loyal, active, new
  - **Estimate**: 1 hour

### 3.3 Customer Segmentation Service
- [ ] Task 3.3.1: [BE] Create `CustomerSegmentationService` in `src/customer/customer-segmentation.service.ts`
  - Inject CustomerSegment, CustomerSegmentAssignment, CustomerAnalytics
  - **Estimate**: 30 minutes

- [ ] Task 3.3.2: [BE] Implement `createSegment(segmentData)` method
  - Create segment
  - If auto_assign, call assignCustomersToSegment
  - **Estimate**: 1 hour

- [ ] Task 3.3.3: [BE] Implement `assignCustomersToSegment(segmentId)` method
  - Get segment
  - Find eligible customers
  - Transaction: create assignments, update segment count
  - **Estimate**: 2 hours

- [ ] Task 3.3.4: [BE] Implement `findEligibleCustomers(criteria)` private method
  - Build query with CustomerAnalytics join
  - Apply criteria filters
  - **Estimate**: 2 hours

- [ ] Task 3.3.5: [BE] Implement `buildCriteriaWhere(criteria)` private method
  - Build Sequelize where clause from criteria JSON
  - Handle: totalSpentMin/Max, totalOrdersMin, daysSinceLastOrderMax, churnRiskMin/Max
  - **Estimate**: 2 hours

### 3.4 Customer Note Service
- [ ] Task 3.4.1: [BE] Create `CustomerNoteService` in `src/customer/customer-note.service.ts` extending `CrudService<CustomerNote>`
  - **Estimate**: 30 minutes

- [ ] Task 3.4.2: [BE] Implement `addCustomerNote(customerId, noteData, authorId)` method
  - Validate customer exists
  - Create note with author_id
  - **Estimate**: 1 hour

- [ ] Task 3.4.3: [BE] Implement `getCustomerNotes(customerId, queryDto)` method
  - Pagination
  - Include author information
  - **Estimate**: 1 hour

- [ ] Task 3.4.4: [BE] Implement `updateCustomerNote(noteId, updateData)` and `deleteCustomerNote(noteId)` methods
  - **Estimate**: 1 hour

### 3.5 Customer Export Service
- [ ] Task 3.5.1: [BE] Create `CustomerExportService` in `src/customer/customer-export.service.ts`
  - Install and configure xlsx library
  - **Estimate**: 30 minutes

- [ ] Task 3.5.2: [BE] Implement `exportCustomers(exportDto)` method
  - Get customers with filters
  - Format data (mask sensitive fields)
  - Generate Excel/CSV
  - Return buffer
  - **Estimate**: 3 hours

---

## Phase 4: Backend - Controllers

### 4.1 Customer Controller
- [ ] Task 4.1.1: [BE] Create `CustomerController` in `src/customer/customer.controller.ts`
  - Decorators: @Controller('admin/customers'), @ApiTags, @UseGuards, @Roles
  - Inject CustomerService, CustomerAnalyticsService, CustomerNoteService, etc.
  - **Estimate**: 30 minutes

- [ ] Task 4.1.2: [BE] Implement `GET /admin/customers` endpoint
  - Query: CustomerQueryDto
  - Return: IPaginatedResult<CustomerDto>
  - **Estimate**: 1 hour

- [ ] Task 4.1.3: [BE] Implement `GET /admin/customers/:id` endpoint
  - Return: CustomerDetailDto
  - **Estimate**: 30 minutes

- [ ] Task 4.1.4: [BE] Implement `PUT /admin/customers/:id/status` endpoint
  - @Roles('admin') only
  - Body: UpdateCustomerStatusDto
  - **Estimate**: 30 minutes

- [ ] Task 4.1.5: [BE] Implement `GET /admin/customers/:id/analytics` endpoint
  - Call CustomerAnalyticsService.calculateCustomerAnalytics
  - Return: CustomerAnalyticsDto
  - **Estimate**: 1 hour

- [ ] Task 4.1.6: [BE] Implement `GET /admin/customers/:id/orders` endpoint
  - Query: OrderQueryDto
  - Return: IPaginatedResult<OrderDto>
  - **Estimate**: 1 hour

- [ ] Task 4.1.7: [BE] Implement `POST /admin/customers/:id/notes` endpoint
  - Body: CreateCustomerNoteDto
  - Return: CustomerNoteDto
  - **Estimate**: 30 minutes

- [ ] Task 4.1.8: [BE] Implement `GET /admin/customers/:id/notes` endpoint
  - Query: NoteQueryDto
  - Return: IPaginatedResult<CustomerNoteDto>
  - **Estimate**: 30 minutes

- [ ] Task 4.1.9: [BE] Implement `GET /admin/customers/segments` endpoint
  - Return: CustomerSegmentDto[]
  - **Estimate**: 30 minutes

- [ ] Task 4.1.10: [BE] Implement `POST /admin/customers/segments` endpoint
  - Body: CreateCustomerSegmentDto
  - Return: CustomerSegmentDto
  - **Estimate**: 30 minutes

- [ ] Task 4.1.11: [BE] Implement `GET /admin/customers/export` endpoint
  - Query: CustomerExportDto
  - Return: File download (Excel/CSV)
  - **Estimate**: 1 hour

---

## Phase 5: Backend - Module & Providers

### 5.1 Customer Module
- [ ] Task 5.1.1: [BE] Create `CustomerModule` in `src/customer/customer.module.ts`
  - Import SequelizeModule.forFeature([CustomerNote, CustomerAnalytics, CustomerSegment, CustomerSegmentAssignment])
  - Register: CustomerService, CustomerAnalyticsService, CustomerSegmentationService, CustomerNoteService, CustomerExportService
  - Register: CustomerController
  - Import: UserModule, OrderModule (for dependencies)
  - **Estimate**: 1 hour

- [ ] Task 5.1.2: [BE] Register CustomerModule in `AppModule`
  - Import CustomerModule
  - **Estimate**: 15 minutes

### 5.2 Providers & Guards
- [ ] Task 5.2.1: [BE] Create `CustomerAccessGuard` in `src/customer/guards/customer-access.guard.ts` (if needed)
  - Ensure proper access to customer data
  - **Estimate**: 1 hour

---

## Phase 6: Background Jobs & Caching

### 6.1 Analytics Background Jobs
- [ ] Task 6.1.1: [BE] Create background job for analytics calculation
  - Use @nestjs/bull or @nestjs/schedule
  - Scheduled job to recalculate analytics for all customers (daily)
  - **Estimate**: 2 hours

- [ ] Task 6.1.2: [BE] Create event listener for order.created
  - Update customer analytics when new order is created
  - **Estimate**: 1 hour

### 6.2 Caching
- [ ] Task 6.2.1: [BE] Implement caching in CustomerService
  - Cache customer details (TTL: 30 minutes)
  - Cache customer lists (TTL: 15 minutes)
  - Invalidate on updates
  - **Estimate**: 2 hours

- [ ] Task 6.2.2: [BE] Implement caching in CustomerAnalyticsService
  - Cache analytics (TTL: 1 hour)
  - Invalidate on order updates
  - **Estimate**: 1 hour

---

## Phase 7: Testing

### 7.1 Unit Tests
- [ ] Task 7.1.1: [TEST] Write unit tests for `CustomerService.getCustomers()`
  - Test filtering, pagination, sorting
  - Mock database calls
  - **Estimate**: 2 hours

- [ ] Task 7.1.2: [TEST] Write unit tests for `CustomerService.getCustomerById()`
  - Test with/without analytics
  - Test customer not found
  - **Estimate**: 1 hour

- [ ] Task 7.1.3: [TEST] Write unit tests for `CustomerAnalyticsService.calculateCustomerAnalytics()`
  - Test RFM calculation
  - Test churn risk calculation
  - Test segment determination
  - **Estimate**: 3 hours

- [ ] Task 7.1.4: [TEST] Write unit tests for `CustomerSegmentationService`
  - Test createSegment
  - Test assignCustomersToSegment
  - Test criteria matching
  - **Estimate**: 2 hours

- [ ] Task 7.1.5: [TEST] Write unit tests for `CustomerNoteService`
  - Test CRUD operations
  - **Estimate**: 1 hour

### 7.2 Integration Tests
- [ ] Task 7.2.1: [TEST] Write integration tests for CustomerController endpoints
  - Test GET /admin/customers with various filters
  - Test GET /admin/customers/:id
  - Test POST /admin/customers/:id/notes
  - Use test database
  - **Estimate**: 4 hours

- [ ] Task 7.2.2: [TEST] Write integration tests for analytics calculation
  - Create test orders
  - Verify analytics calculation
  - **Estimate**: 2 hours

- [ ] Task 7.2.3: [TEST] Write integration tests for segmentation
  - Create segment with criteria
  - Verify customer assignment
  - **Estimate**: 2 hours

### 7.3 E2E Tests
- [ ] Task 7.3.1: [TEST] Write E2E test for complete customer management workflow
  - Create customer → View details → Add note → Update status
  - **Estimate**: 2 hours

- [ ] Task 7.3.2: [TEST] Write E2E test for analytics generation
  - Create orders → Calculate analytics → Verify metrics
  - **Estimate**: 2 hours

- [ ] Task 7.3.3: [TEST] Write E2E test for customer segmentation
  - Create segment → Auto-assign → Verify assignments
  - **Estimate**: 2 hours

---

## Phase 8: Documentation & Cleanup

### 8.1 Documentation
- [ ] Task 8.1.1: [DOC] Add JSDoc comments to all service methods
  - **Estimate**: 1 hour

- [ ] Task 8.1.2: [DOC] Update API documentation (Swagger)
  - Ensure all endpoints are documented
  - Add examples
  - **Estimate**: 1 hour

### 8.2 Code Review & Cleanup
- [ ] Task 8.2.1: [CLEANUP] Run linter and fix all issues
  - `pnpm lint`
  - **Estimate**: 30 minutes

- [ ] Task 8.2.2: [CLEANUP] Run formatter
  - `pnpm format`
  - **Estimate**: 15 minutes

- [ ] Task 8.2.3: [CLEANUP] Verify all imports are correct
  - Check for unused imports
  - **Estimate**: 30 minutes

---

## Summary

**Total Tasks**: 70+ tasks  
**Estimated Effort**: ~80-100 hours  
**Phases**: 8 phases

### Priority Order
1. **Phase 1**: Database & Entities (Foundation)
2. **Phase 2**: DTOs (Required for services)
3. **Phase 3**: Services (Core business logic)
4. **Phase 4**: Controllers (API endpoints)
5. **Phase 5**: Module & Providers (Integration)
6. **Phase 6**: Background Jobs & Caching (Performance)
7. **Phase 7**: Testing (Quality assurance)
8. **Phase 8**: Documentation & Cleanup (Finalization)

### Dependencies
- CustomerService depends on User entity (already exists)
- CustomerAnalyticsService depends on Order entity (from Order module)
- All services depend on DTOs
- Controllers depend on Services
- Module depends on all components

### Notes
- Customer analytics calculation can be heavy - consider background jobs
- Segmentation criteria matching requires efficient queries
- Export functionality needs to handle large datasets
- Caching is critical for performance with large customer base
