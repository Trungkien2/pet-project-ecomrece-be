# Technical Design Document - Shipping Management Module (BE.04)

## 1. Thông tin tài liệu

- **Module**: Shipping Management (BE.04)
- **Phiên bản**: 1.0
- **Ngày tạo**: 27/07/2025
- **Người viết**: Development Team
- **SRS Reference**: BE.04 - Quản lý Vận chuyển

## 2. Tổng quan module

Module Shipping Management quản lý toàn bộ hệ thống vận chuyển, bao gồm cấu hình phương thức vận chuyển, tính toán phí ship tự động và tích hợp với các đơn vị vận chuyển như GHN, GHTK, ViettelPost.

### 2.1 Chức năng chính

- **BE.04.1**: Cấu hình phương thức vận chuyển và biểu phí
- **BE.04.2**: Tích hợp API với các đơn vị vận chuyển
- **BE.04.3**: Tính toán phí vận chuyển tự động
- **BE.04.4**: Tạo và quản lý đơn vận chuyển
- **BE.04.5**: Theo dõi trạng thái vận chuyển
- **BE.04.6**: Quản lý khu vực giao hàng

## 3. Kiến trúc module

### 3.1 Cấu trúc thư mục

```
src/shipping/
├── shipping.controller.ts
├── shipping.service.ts
├── shipping.module.ts
├── entities/
│   ├── shipping-method.entity.ts
│   ├── shipping-zone.entity.ts
│   ├── shipping-rate.entity.ts
│   ├── shipping-provider.entity.ts
│   └── shipping-tracking.entity.ts
├── dto/
│   ├── shipping-calculation.dto.ts
│   ├── shipping-method.dto.ts
│   ├── shipping-rate.dto.ts
│   ├── create-shipment.dto.ts
│   └── tracking-update.dto.ts
├── services/
│   ├── shipping-calculator.service.ts
│   ├── shipping-provider.service.ts
│   ├── ghn.service.ts
│   ├── ghtk.service.ts
│   └── viettelpost.service.ts
├── interfaces/
│   ├── shipping-provider.interface.ts
│   ├── shipping-calculation.interface.ts
│   └── tracking-event.interface.ts
├── enums/
│   ├── shipping-method.enum.ts
│   ├── shipping-status.enum.ts
│   └── weight-unit.enum.ts
├── providers/
│   └── shipping.providers.ts
└── guards/
    └── shipping-admin.guard.ts
```

### 3.2 Dependencies

- `@nestjs/common`: Controllers, Services
- `sequelize-typescript`: ORM entities
- `axios`: HTTP client for API calls
- `@nestjs/schedule`: Scheduled tasks for tracking updates
- `@nestjs/bull`: Queue processing for shipments
- `class-transformer`: Data transformation

## 4. Database Design

### 4.1 Shipping Method Entity

```sql
CREATE TABLE tbl_shipping_method (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  provider_id VARCHAR(36) NULL,
  
  -- Method configuration
  method_type ENUM('standard', 'express', 'same_day', 'economy') DEFAULT 'standard',
  delivery_time_min INT, -- minimum delivery days
  delivery_time_max INT, -- maximum delivery days
  
  -- Calculation settings
  calculation_type ENUM('fixed', 'weight_based', 'distance_based', 'zone_based') DEFAULT 'fixed',
  base_cost DECIMAL(10,2) DEFAULT 0,
  cost_per_kg DECIMAL(8,2) DEFAULT 0,
  free_shipping_threshold DECIMAL(12,2) DEFAULT 0,
  
  -- Restrictions
  max_weight DECIMAL(8,2), -- kg
  max_dimensions JSON, -- {length, width, height} in cm
  min_order_value DECIMAL(12,2) DEFAULT 0,
  
  -- Status and settings
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  
  -- COD settings
  cod_supported BOOLEAN DEFAULT FALSE,
  cod_fee_type ENUM('fixed', 'percentage') DEFAULT 'fixed',
  cod_fee_value DECIMAL(8,2) DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (provider_id) REFERENCES tbl_shipping_provider(id),
  INDEX idx_code (code),
  INDEX idx_is_active (is_active),
  INDEX idx_display_order (display_order)
);
```

### 4.2 Shipping Zone Entity

```sql
CREATE TABLE tbl_shipping_zone (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Geographic coverage
  countries JSON DEFAULT '["VN"]', -- ISO country codes
  provinces JSON, -- Province/state codes
  districts JSON, -- District codes (optional)
  wards JSON, -- Ward codes (optional)
  
  -- Zone settings
  is_active BOOLEAN DEFAULT TRUE,
  priority INT DEFAULT 0, -- Higher priority zones matched first
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_name (name),
  INDEX idx_is_active (is_active),
  INDEX idx_priority (priority)
);
```

### 4.3 Shipping Rate Entity

```sql
CREATE TABLE tbl_shipping_rate (
  id VARCHAR(36) PRIMARY KEY,
  method_id VARCHAR(36) NOT NULL,
  zone_id VARCHAR(36) NOT NULL,
  
  -- Weight ranges
  weight_from DECIMAL(8,2) DEFAULT 0, -- kg
  weight_to DECIMAL(8,2), -- kg, NULL means unlimited
  
  -- Order value ranges
  order_value_from DECIMAL(12,2) DEFAULT 0,
  order_value_to DECIMAL(12,2), -- NULL means unlimited
  
  -- Pricing
  base_rate DECIMAL(10,2) NOT NULL,
  rate_per_kg DECIMAL(8,2) DEFAULT 0,
  
  -- Additional fees
  fuel_surcharge_rate DECIMAL(5,2) DEFAULT 0, -- percentage
  remote_area_fee DECIMAL(8,2) DEFAULT 0,
  insurance_rate DECIMAL(5,2) DEFAULT 0, -- percentage of order value
  
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (method_id) REFERENCES tbl_shipping_method(id) ON DELETE CASCADE,
  FOREIGN KEY (zone_id) REFERENCES tbl_shipping_zone(id) ON DELETE CASCADE,
  INDEX idx_method_zone (method_id, zone_id),
  INDEX idx_weight_range (weight_from, weight_to),
  INDEX idx_order_value_range (order_value_from, order_value_to)
);
```

### 4.4 Shipping Provider Entity

```sql
CREATE TABLE tbl_shipping_provider (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  logo_url VARCHAR(500),
  website_url VARCHAR(255),
  
  -- API Configuration
  api_endpoint VARCHAR(255),
  api_key VARCHAR(255),
  api_secret VARCHAR(255),
  test_mode BOOLEAN DEFAULT TRUE,
  
  -- Provider capabilities
  supports_tracking BOOLEAN DEFAULT FALSE,
  supports_cod BOOLEAN DEFAULT FALSE,
  supports_insurance BOOLEAN DEFAULT FALSE,
  supports_pickup BOOLEAN DEFAULT FALSE,
  
  -- Service areas
  domestic_service BOOLEAN DEFAULT TRUE,
  international_service BOOLEAN DEFAULT FALSE,
  
  -- Settings
  is_active BOOLEAN DEFAULT TRUE,
  auto_sync_tracking BOOLEAN DEFAULT FALSE,
  
  -- Rate limiting
  rate_limit_per_minute INT DEFAULT 60,
  last_api_call DATETIME,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_code (code),
  INDEX idx_is_active (is_active)
);
```

### 4.5 Shipping Tracking Entity

```sql
CREATE TABLE tbl_shipping_tracking (
  id VARCHAR(36) PRIMARY KEY,
  shipment_id VARCHAR(36) NOT NULL,
  tracking_number VARCHAR(100) NOT NULL,
  provider_id VARCHAR(36) NOT NULL,
  
  -- Current status
  current_status ENUM('pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned', 'cancelled') DEFAULT 'pending',
  current_location VARCHAR(255),
  estimated_delivery DATETIME,
  actual_delivery DATETIME,
  
  -- Tracking events (JSON array)
  tracking_events JSON,
  
  -- Delivery information
  delivered_to VARCHAR(255),
  delivery_signature VARCHAR(255),
  delivery_notes TEXT,
  
  -- Provider response
  provider_response JSON,
  last_sync_at DATETIME,
  sync_status ENUM('success', 'failed', 'pending') DEFAULT 'pending',
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (shipment_id) REFERENCES tbl_order_shipment(id) ON DELETE CASCADE,
  FOREIGN KEY (provider_id) REFERENCES tbl_shipping_provider(id),
  UNIQUE KEY unique_tracking_number (tracking_number, provider_id),
  INDEX idx_shipment_id (shipment_id),
  INDEX idx_tracking_number (tracking_number),
  INDEX idx_current_status (current_status),
  INDEX idx_last_sync_at (last_sync_at)
);
```

## 5. API Endpoints

### 5.1 Admin Shipping Controller

```typescript
@Controller('admin/shipping')
@ApiTags('admin-shipping')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminShippingController {
  
  // Shipping Methods
  @Get('methods')
  @ApiOperation({ summary: 'Get all shipping methods' })
  async getShippingMethods(): Promise<ShippingMethodDto[]>

  @Post('methods')
  @ApiOperation({ summary: 'Create shipping method' })
  async createShippingMethod(@Body() methodDto: CreateShippingMethodDto): Promise<ShippingMethodDto>

  @Put('methods/:id')
  @ApiOperation({ summary: 'Update shipping method' })
  async updateShippingMethod(@Param('id') id: string, @Body() methodDto: UpdateShippingMethodDto): Promise<ShippingMethodDto>

  @Delete('methods/:id')
  @ApiOperation({ summary: 'Delete shipping method' })
  async deleteShippingMethod(@Param('id') id: string): Promise<void>

  // Shipping Zones
  @Get('zones')
  @ApiOperation({ summary: 'Get all shipping zones' })
  async getShippingZones(): Promise<ShippingZoneDto[]>

  @Post('zones')
  @ApiOperation({ summary: 'Create shipping zone' })
  async createShippingZone(@Body() zoneDto: CreateShippingZoneDto): Promise<ShippingZoneDto>

  @Put('zones/:id')
  @ApiOperation({ summary: 'Update shipping zone' })
  async updateShippingZone(@Param('id') id: string, @Body() zoneDto: UpdateShippingZoneDto): Promise<ShippingZoneDto>

  // Shipping Rates
  @Get('rates')
  @ApiOperation({ summary: 'Get shipping rates' })
  async getShippingRates(@Query() queryDto: ShippingRateQueryDto): Promise<ShippingRateDto[]>

  @Post('rates')
  @ApiOperation({ summary: 'Create shipping rate' })
  async createShippingRate(@Body() rateDto: CreateShippingRateDto): Promise<ShippingRateDto>

  @Put('rates/:id')
  @ApiOperation({ summary: 'Update shipping rate' })
  async updateShippingRate(@Param('id') id: string, @Body() rateDto: UpdateShippingRateDto): Promise<ShippingRateDto>

  // Shipping Providers
  @Get('providers')
  @ApiOperation({ summary: 'Get shipping providers' })
  async getShippingProviders(): Promise<ShippingProviderDto[]>

  @Post('providers')
  @ApiOperation({ summary: 'Configure shipping provider' })
  async configureShippingProvider(@Body() providerDto: ConfigureShippingProviderDto): Promise<ShippingProviderDto>

  @Post('providers/:id/test')
  @ApiOperation({ summary: 'Test provider API connection' })
  async testProviderConnection(@Param('id') id: string): Promise<ProviderTestResultDto>

  // Tracking
  @Get('tracking/:trackingNumber')
  @ApiOperation({ summary: 'Get tracking information' })
  async getTrackingInfo(@Param('trackingNumber') trackingNumber: string): Promise<TrackingInfoDto>

  @Post('tracking/sync')
  @ApiOperation({ summary: 'Sync tracking information' })
  async syncTrackingInfo(@Body() syncDto: TrackingSyncDto): Promise<TrackingSyncResultDto>
}
```

### 5.2 Public Shipping Controller

```typescript
@Controller('shipping')
@ApiTags('shipping')
export class ShippingController {
  
  @Post('calculate')
  @ApiOperation({ summary: 'Calculate shipping costs' })
  async calculateShipping(@Body() calculationDto: ShippingCalculationDto): Promise<ShippingQuoteDto>

  @Get('methods')
  @ApiOperation({ summary: 'Get available shipping methods for location' })
  async getAvailableShippingMethods(@Query() locationDto: ShippingLocationDto): Promise<AvailableShippingMethodDto[]>

  @Get('zones/check')
  @ApiOperation({ summary: 'Check if address is in service area' })
  async checkServiceArea(@Query() addressDto: AddressCheckDto): Promise<ServiceAreaCheckDto>

  @Get('tracking/:trackingNumber')
  @ApiOperation({ summary: 'Track shipment (public)' })
  async trackShipment(@Param('trackingNumber') trackingNumber: string): Promise<PublicTrackingInfoDto>

  @Get('delivery-estimate')
  @ApiOperation({ summary: 'Get delivery time estimate' })
  async getDeliveryEstimate(@Query() estimateDto: DeliveryEstimateDto): Promise<DeliveryEstimateResponseDto>
}
```

## 6. Business Logic

### 6.1 Shipping Calculator Service

```typescript
@Injectable()
export class ShippingCalculatorService {
  
  async calculateShippingCost(request: ShippingCalculationRequest): Promise<ShippingQuote[]> {
    const { items, destination, orderValue, weight, dimensions } = request;
    
    // Find applicable shipping zone
    const zone = await this.findShippingZone(destination);
    if (!zone) {
      throw new ShippingZoneNotFoundException(destination);
    }
    
    // Get available shipping methods for zone
    const methods = await this.getAvailableShippingMethods(zone.id, weight, dimensions, orderValue);
    
    const quotes: ShippingQuote[] = [];
    
    for (const method of methods) {
      try {
        const quote = await this.calculateMethodCost(method, weight, orderValue, zone, items);
        quotes.push(quote);
      } catch (error) {
        this.logger.warn(`Failed to calculate cost for method ${method.name}`, error);
      }
    }
    
    return quotes.sort((a, b) => a.totalCost - b.totalCost);
  }
  
  private async calculateMethodCost(
    method: ShippingMethod,
    weight: number,
    orderValue: number,
    zone: ShippingZone,
    items: CartItem[]
  ): Promise<ShippingQuote> {
    
    let totalCost = 0;
    let breakdown: CostBreakdown = {};
    
    // Check for free shipping threshold
    if (method.freeShippingThreshold > 0 && orderValue >= method.freeShippingThreshold) {
      return {
        methodId: method.id,
        methodName: method.name,
        methodType: method.methodType,
        totalCost: 0,
        isFreeShipping: true,
        estimatedDays: { min: method.deliveryTimeMin, max: method.deliveryTimeMax },
        breakdown: { baseRate: 0, note: 'Free shipping applied' }
      };
    }
    
    switch (method.calculationType) {
      case CalculationType.FIXED:
        totalCost = method.baseCost;
        breakdown.baseRate = method.baseCost;
        break;
        
      case CalculationType.WEIGHT_BASED:
        totalCost = await this.calculateWeightBasedCost(method, weight, zone);
        breakdown = this.getWeightBasedBreakdown(method, weight, zone);
        break;
        
      case CalculationType.ZONE_BASED:
        totalCost = await this.calculateZoneBasedCost(method, zone, weight, orderValue);
        breakdown = this.getZoneBasedBreakdown(method, zone, weight, orderValue);
        break;
        
      case CalculationType.DISTANCE_BASED:
        totalCost = await this.calculateDistanceBasedCost(method, zone, weight);
        breakdown = this.getDistanceBasedBreakdown(method, zone, weight);
        break;
    }
    
    // Add additional fees
    const additionalFees = await this.calculateAdditionalFees(method, orderValue, items);
    totalCost += additionalFees.total;
    breakdown = { ...breakdown, ...additionalFees.breakdown };
    
    return {
      methodId: method.id,
      methodName: method.name,
      methodType: method.methodType,
      totalCost: Math.round(totalCost),
      isFreeShipping: false,
      estimatedDays: { min: method.deliveryTimeMin, max: method.deliveryTimeMax },
      breakdown,
      provider: method.provider?.name
    };
  }
  
  private async calculateWeightBasedCost(method: ShippingMethod, weight: number, zone: ShippingZone): Promise<number> {
    const rate = await this.findApplicableRate(method.id, zone.id, weight);
    
    if (!rate) {
      throw new ShippingRateNotFoundException(method.id, zone.id, weight);
    }
    
    let cost = rate.baseRate;
    
    if (rate.ratePerKg > 0 && weight > 1) {
      const additionalWeight = Math.max(0, weight - 1);
      cost += additionalWeight * rate.ratePerKg;
    }
    
    return cost;
  }
  
  private async calculateAdditionalFees(method: ShippingMethod, orderValue: number, items: CartItem[]): Promise<{total: number, breakdown: any}> {
    let total = 0;
    let breakdown: any = {};
    
    // COD fee
    if (method.codSupported && method.codFeeValue > 0) {
      const codFee = method.codFeeType === 'percentage' 
        ? orderValue * (method.codFeeValue / 100)
        : method.codFeeValue;
      total += codFee;
      breakdown.codFee = codFee;
    }
    
    // Insurance fee
    const needsInsurance = await this.checkInsuranceRequirement(items, orderValue);
    if (needsInsurance) {
      const insuranceFee = orderValue * 0.005; // 0.5% insurance
      total += insuranceFee;
      breakdown.insuranceFee = insuranceFee;
    }
    
    // Fuel surcharge
    const fuelSurcharge = await this.getCurrentFuelSurcharge();
    if (fuelSurcharge > 0) {
      const surcharge = total * (fuelSurcharge / 100);
      total += surcharge;
      breakdown.fuelSurcharge = surcharge;
    }
    
    return { total, breakdown };
  }
}
```

### 6.2 Shipping Provider Service

```typescript
@Injectable()
export class ShippingProviderService {
  
  private providers: Map<string, IShippingProviderAdapter> = new Map();
  
  constructor(
    private ghnService: GHNService,
    private ghtkService: GHTKService,
    private viettelPostService: ViettelPostService
  ) {
    this.providers.set('ghn', this.ghnService);
    this.providers.set('ghtk', this.ghtkService);
    this.providers.set('viettelpost', this.viettelPostService);
  }
  
  async createShipment(shipmentData: CreateShipmentRequest): Promise<CreateShipmentResponse> {
    const provider = this.getProvider(shipmentData.providerId);
    
    try {
      const result = await provider.createShipment({
        orderId: shipmentData.orderId,
        fromAddress: shipmentData.fromAddress,
        toAddress: shipmentData.toAddress,
        items: shipmentData.items,
        serviceType: shipmentData.serviceType,
        codAmount: shipmentData.codAmount,
        insurance: shipmentData.insurance,
        note: shipmentData.note
      });
      
      // Save tracking information
      await this.saveTrackingInfo(shipmentData.shipmentId, result);
      
      return result;
      
    } catch (error) {
      this.logger.error(`Failed to create shipment with provider ${shipmentData.providerId}`, error);
      throw new ShipmentCreationException(shipmentData.providerId, error.message);
    }
  }
  
  async getShippingRates(rateRequest: ShippingRateRequest): Promise<ShippingRateResponse[]> {
    const rates: ShippingRateResponse[] = [];
    
    for (const [providerId, provider] of this.providers) {
      try {
        const providerRates = await provider.getRates(rateRequest);
        rates.push(...providerRates.map(rate => ({
          ...rate,
          providerId,
          providerName: provider.getProviderName()
        })));
      } catch (error) {
        this.logger.warn(`Failed to get rates from provider ${providerId}`, error);
      }
    }
    
    return rates.sort((a, b) => a.cost - b.cost);
  }
  
  async trackShipment(trackingNumber: string, providerId: string): Promise<TrackingInfo> {
    const provider = this.getProvider(providerId);
    
    try {
      const trackingInfo = await provider.trackShipment(trackingNumber);
      
      // Update local tracking record
      await this.updateTrackingRecord(trackingNumber, trackingInfo);
      
      return trackingInfo;
      
    } catch (error) {
      this.logger.error(`Failed to track shipment ${trackingNumber} with provider ${providerId}`, error);
      throw new TrackingException(trackingNumber, providerId, error.message);
    }
  }
  
  private getProvider(providerId: string): IShippingProviderAdapter {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new UnsupportedProviderException(providerId);
    }
    return provider;
  }
  
  async syncAllTrackingInfo(): Promise<TrackingSyncResult> {
    const activeShipments = await this.getActiveShipments();
    const results: TrackingSyncResult = {
      total: activeShipments.length,
      successful: 0,
      failed: 0,
      errors: []
    };
    
    for (const shipment of activeShipments) {
      try {
        await this.trackShipment(shipment.trackingNumber, shipment.providerId);
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          trackingNumber: shipment.trackingNumber,
          error: error.message
        });
      }
    }
    
    return results;
  }
}
```

### 6.3 GHN Service Implementation

```typescript
@Injectable()
export class GHNService implements IShippingProviderAdapter {
  
  private readonly API_BASE_URL = 'https://dev-online-gateway.ghn.vn/shiip/public-api';
  
  constructor(
    private httpService: HttpService,
    private configService: ConfigService
  ) {}
  
  getProviderName(): string {
    return 'Giao Hàng Nhanh (GHN)';
  }
  
  async getRates(request: ShippingRateRequest): Promise<ProviderShippingRate[]> {
    const url = `${this.API_BASE_URL}/v2/shipping-order/fee`;
    
    const payload = {
      service_id: null,
      service_type_id: 2, // Standard service
      to_district_id: request.toAddress.districtId,
      to_ward_code: request.toAddress.wardCode,
      height: request.dimensions?.height || 10,
      length: request.dimensions?.length || 20,
      weight: Math.ceil(request.weight * 1000), // Convert to grams
      width: request.dimensions?.width || 15,
      insurance_value: request.insuranceValue || 0,
      cod_failed_amount: request.codAmount || 0
    };
    
    try {
      const response = await this.httpService.post(url, payload, {
        headers: {
          'Token': this.configService.get('GHN_API_TOKEN'),
          'ShopId': this.configService.get('GHN_SHOP_ID'),
          'Content-Type': 'application/json'
        }
      }).toPromise();
      
      if (response.data.code === 200) {
        return [{
          serviceType: 'standard',
          serviceName: 'Giao hàng tiêu chuẩn',
          cost: response.data.data.total,
          estimatedDays: { min: 2, max: 4 },
          rawResponse: response.data
        }];
      } else {
        throw new Error(response.data.message || 'Unknown GHN API error');
      }
      
    } catch (error) {
      this.logger.error('GHN rate calculation failed', error);
      throw new ProviderApiException('GHN', 'Rate calculation failed', error);
    }
  }
  
  async createShipment(request: CreateProviderShipmentRequest): Promise<CreateShipmentResponse> {
    const url = `${this.API_BASE_URL}/v2/shipping-order/create`;
    
    const payload = {
      to_name: request.toAddress.fullName,
      to_phone: request.toAddress.phoneNumber,
      to_address: request.toAddress.streetAddress,
      to_ward_code: request.toAddress.wardCode,
      to_district_id: request.toAddress.districtId,
      cod_amount: request.codAmount || 0,
      content: request.items.map(item => item.name).join(', '),
      weight: Math.ceil(request.totalWeight * 1000),
      length: request.dimensions?.length || 20,
      width: request.dimensions?.width || 15,
      height: request.dimensions?.height || 10,
      service_type_id: this.getServiceTypeId(request.serviceType),
      payment_type_id: request.codAmount > 0 ? 2 : 1, // 1: Shop pays, 2: Recipient pays
      note: request.note || '',
      required_note: 'KHONGCHOXEMHANG', // Do not allow inspection
      items: request.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        weight: Math.ceil(item.weight * 1000)
      }))
    };
    
    try {
      const response = await this.httpService.post(url, payload, {
        headers: {
          'Token': this.configService.get('GHN_API_TOKEN'),
          'ShopId': this.configService.get('GHN_SHOP_ID'),
          'Content-Type': 'application/json'
        }
      }).toPromise();
      
      if (response.data.code === 200) {
        return {
          trackingNumber: response.data.data.order_code,
          shipmentId: response.data.data.order_code,
          estimatedDelivery: this.calculateEstimatedDelivery(2, 4),
          cost: response.data.data.total_fee,
          rawResponse: response.data
        };
      } else {
        throw new Error(response.data.message || 'Unknown GHN API error');
      }
      
    } catch (error) {
      this.logger.error('GHN shipment creation failed', error);
      throw new ProviderApiException('GHN', 'Shipment creation failed', error);
    }
  }
  
  async trackShipment(trackingNumber: string): Promise<TrackingInfo> {
    const url = `${this.API_BASE_URL}/v2/shipping-order/detail`;
    
    const payload = {
      order_code: trackingNumber
    };
    
    try {
      const response = await this.httpService.post(url, payload, {
        headers: {
          'Token': this.configService.get('GHN_API_TOKEN'),
          'ShopId': this.configService.get('GHN_SHOP_ID'),
          'Content-Type': 'application/json'
        }
      }).toPromise();
      
      if (response.data.code === 200) {
        const data = response.data.data;
        return {
          trackingNumber,
          status: this.mapGHNStatus(data.status),
          currentLocation: data.current_address || '',
          estimatedDelivery: data.expected_delivery_time,
          actualDelivery: data.deliver_date,
          events: this.mapGHNEvents(data.log || []),
          deliveredTo: data.deliver_to,
          rawResponse: response.data
        };
      } else {
        throw new Error(response.data.message || 'Unknown GHN API error');
      }
      
    } catch (error) {
      this.logger.error(`GHN tracking failed for ${trackingNumber}`, error);
      throw new ProviderApiException('GHN', 'Tracking failed', error);
    }
  }
  
  private getServiceTypeId(serviceType: string): number {
    const serviceMap = {
      'standard': 2,
      'express': 1,
      'economy': 3
    };
    return serviceMap[serviceType] || 2;
  }
  
  private mapGHNStatus(ghnStatus: string): ShippingStatus {
    const statusMap = {
      'ready_to_pick': ShippingStatus.PENDING,
      'picking': ShippingStatus.PICKED_UP,
      'cancel': ShippingStatus.CANCELLED,
      'money_collect_picking': ShippingStatus.PICKED_UP,
      'picked': ShippingStatus.PICKED_UP,
      'storing': ShippingStatus.IN_TRANSIT,
      'transporting': ShippingStatus.IN_TRANSIT,
      'sorting': ShippingStatus.IN_TRANSIT,
      'delivering': ShippingStatus.OUT_FOR_DELIVERY,
      'delivered': ShippingStatus.DELIVERED,
      'delivery_fail': ShippingStatus.FAILED,
      'waiting_to_return': ShippingStatus.FAILED,
      'return': ShippingStatus.RETURNED,
      'return_transporting': ShippingStatus.RETURNED,
      'return_sorting': ShippingStatus.RETURNED,
      'returning': ShippingStatus.RETURNED,
      'returned': ShippingStatus.RETURNED,
      'exception': ShippingStatus.FAILED,
      'damage': ShippingStatus.FAILED,
      'lost': ShippingStatus.FAILED
    };
    
    return statusMap[ghnStatus] || ShippingStatus.PENDING;
  }
  
  private mapGHNEvents(ghnEvents: any[]): TrackingEvent[] {
    return ghnEvents.map(event => ({
      timestamp: new Date(event.updated_date),
      status: this.mapGHNStatus(event.status),
      location: event.action_at || '',
      description: event.reason || event.status,
      rawData: event
    }));
  }
}
```

## 7. Data Transfer Objects (DTOs)

### 7.1 Shipping Calculation DTOs

```typescript
export class ShippingCalculationDto {
  @ValidateNested()
  @Type(() => AddressDto)
  destination: AddressDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];

  @IsNumber()
  @Min(0)
  totalWeight: number;

  @IsNumber()
  @Min(0)
  totalValue: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => DimensionsDto)
  dimensions?: DimensionsDto;

  @IsOptional()
  @IsNumber()
  @Min(0)
  codAmount?: number;

  @IsOptional()
  @IsBoolean()
  needsInsurance?: boolean;
}

export class ShippingQuoteDto {
  methodId: string;
  methodName: string;
  methodType: ShippingMethodType;
  providerName?: string;
  totalCost: number;
  isFreeShipping: boolean;
  estimatedDays: {
    min: number;
    max: number;
  };
  breakdown: CostBreakdown;
  restrictions?: string[];
  features: string[];
}

export class CostBreakdown {
  baseRate?: number;
  weightCharge?: number;
  distanceCharge?: number;
  codFee?: number;
  insuranceFee?: number;
  fuelSurcharge?: number;
  remoteAreaFee?: number;
  note?: string;
}
```

### 7.2 Shipping Method DTOs

```typescript
export class CreateShippingMethodDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  providerId?: string;

  @IsEnum(ShippingMethodType)
  methodType: ShippingMethodType;

  @IsEnum(CalculationType)
  calculationType: CalculationType;

  @IsNumber()
  @Min(0)
  baseCost: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costPerKg?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  freeShippingThreshold?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  deliveryTimeMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  deliveryTimeMax?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxWeight?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => DimensionsDto)
  maxDimensions?: DimensionsDto;

  @IsBoolean()
  @IsOptional()
  codSupported?: boolean = false;

  @IsOptional()
  @IsEnum(CodFeeType)
  codFeeType?: CodFeeType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  codFeeValue?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean = false;
}

export class ShippingMethodDto {
  id: string;
  name: string;
  code: string;
  description?: string;
  provider?: ShippingProviderSummaryDto;
  methodType: ShippingMethodType;
  calculationType: CalculationType;
  baseCost: number;
  costPerKg?: number;
  freeShippingThreshold?: number;
  deliveryTimeMin?: number;
  deliveryTimeMax?: number;
  maxWeight?: number;
  maxDimensions?: DimensionsDto;
  codSupported: boolean;
  codFeeType?: CodFeeType;
  codFeeValue?: number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 7.3 Tracking DTOs

```typescript
export class TrackingInfoDto {
  trackingNumber: string;
  status: ShippingStatus;
  statusDescription: string;
  currentLocation?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  deliveredTo?: string;
  deliverySignature?: string;
  deliveryNotes?: string;
  
  events: TrackingEventDto[];
  
  provider: {
    name: string;
    code: string;
    logoUrl?: string;
  };
  
  lastUpdated: Date;
  canBeCancelled: boolean;
  canBeRescheduled: boolean;
}

export class TrackingEventDto {
  timestamp: Date;
  status: ShippingStatus;
  location: string;
  description: string;
  isDeliveryAttempt: boolean;
  failureReason?: string;
}

export class PublicTrackingInfoDto {
  trackingNumber: string;
  status: string;
  statusDescription: string;
  estimatedDelivery?: string;
  events: {
    date: string;
    time: string;
    status: string;
    location: string;
    description: string;
  }[];
  isDelivered: boolean;
}
```

## 8. Business Rules

### 8.1 Shipping Validation Rules

```typescript
export class ShippingBusinessRules {
  
  static readonly MAX_PACKAGE_WEIGHT = 30; // kg
  static readonly MAX_PACKAGE_DIMENSIONS = {
    length: 150, // cm
    width: 150,
    height: 150
  };
  
  static readonly FREE_SHIPPING_MIN_ORDER = 500000; // 500k VND
  
  static validateShipmentDimensions(dimensions: Dimensions): ValidationResult {
    if (dimensions.length > this.MAX_PACKAGE_DIMENSIONS.length ||
        dimensions.width > this.MAX_PACKAGE_DIMENSIONS.width ||
        dimensions.height > this.MAX_PACKAGE_DIMENSIONS.height) {
      throw new ShippingValidationException('Package dimensions exceed maximum allowed size');
    }
    
    return { valid: true };
  }
  
  static validateShipmentWeight(weight: number): ValidationResult {
    if (weight > this.MAX_PACKAGE_WEIGHT) {
      throw new ShippingValidationException(`Package weight (${weight}kg) exceeds maximum allowed weight (${this.MAX_PACKAGE_WEIGHT}kg)`);
    }
    
    if (weight <= 0) {
      throw new ShippingValidationException('Package weight must be greater than 0');
    }
    
    return { valid: true };
  }
  
  static canCancelShipment(shipment: ShippingTracking): boolean {
    const nonCancellableStatuses = [
      ShippingStatus.DELIVERED,
      ShippingStatus.OUT_FOR_DELIVERY,
      ShippingStatus.CANCELLED,
      ShippingStatus.RETURNED
    ];
    
    return !nonCancellableStatuses.includes(shipment.currentStatus);
  }
  
  static calculateDeliveryEstimate(method: ShippingMethod, zone: ShippingZone): DeliveryEstimate {
    const now = new Date();
    const baseMin = method.deliveryTimeMin || 1;
    const baseMax = method.deliveryTimeMax || 3;
    
    // Add buffer for remote areas
    let additionalDays = 0;
    if (zone.name.includes('remote') || zone.name.includes('island')) {
      additionalDays = 1;
    }
    
    // Add buffer for weekends
    const dayOfWeek = now.getDay();
    if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday or Saturday
      additionalDays += 1;
    }
    
    const minDate = new Date();
    minDate.setDate(now.getDate() + baseMin + additionalDays);
    
    const maxDate = new Date();
    maxDate.setDate(now.getDate() + baseMax + additionalDays);
    
    return {
      earliest: minDate,
      latest: maxDate,
      businessDays: baseMin + baseMax + additionalDays
    };
  }
}
```

## 9. Background Processing

### 9.1 Shipping Processor

```typescript
@Processor('shipping')
export class ShippingProcessor {
  
  @Process('create-shipment')
  async createShipment(job: Job<CreateShipmentJobData>): Promise<void> {
    const { orderId, shipmentData } = job.data;
    
    try {
      // Create shipment with provider
      const result = await this.shippingProviderService.createShipment(shipmentData);
      
      // Update order with tracking information
      await this.orderService.updateShipmentInfo(orderId, {
        trackingNumber: result.trackingNumber,
        providerId: shipmentData.providerId,
        estimatedDelivery: result.estimatedDelivery,
        shippingCost: result.cost
      });
      
      // Send shipping notification to customer
      await this.emailService.sendShippingNotification(orderId, result.trackingNumber);
      
      // Schedule tracking updates
      await this.scheduleTrackingUpdates(result.trackingNumber, shipmentData.providerId);
      
    } catch (error) {
      this.logger.error(`Failed to create shipment for order ${orderId}`, error);
      
      // Update order status to shipping failed
      await this.orderService.updateOrderStatus(orderId, OrderStatus.SHIPPING_FAILED);
      
      throw error;
    }
  }
  
  @Process('update-tracking')
  async updateTracking(job: Job<TrackingUpdateJobData>): Promise<void> {
    const { trackingNumber, providerId } = job.data;
    
    try {
      const trackingInfo = await this.shippingProviderService.trackShipment(trackingNumber, providerId);
      
      // Update local tracking record
      await this.shippingTrackingService.updateTracking(trackingNumber, trackingInfo);
      
      // Check for status changes
      const previousTracking = await this.shippingTrackingService.getPreviousTracking(trackingNumber);
      
      if (previousTracking.currentStatus !== trackingInfo.status) {
        // Trigger status change events
        await this.handleStatusChange(trackingNumber, previousTracking.currentStatus, trackingInfo.status);
      }
      
      // Schedule next update if not delivered
      if (!this.isFinalStatus(trackingInfo.status)) {
        await this.scheduleNextTrackingUpdate(trackingNumber, providerId);
      }
      
    } catch (error) {
      this.logger.error(`Failed to update tracking for ${trackingNumber}`, error);
      
      // Schedule retry with exponential backoff
      const retryDelay = this.calculateRetryDelay(job.attemptsMade);
      await this.shippingQueue.add('update-tracking', job.data, {
        delay: retryDelay,
        attempts: 5
      });
    }
  }
  
  @Cron('0 */2 * * *') // Every 2 hours
  async batchTrackingUpdate(): Promise<void> {
    const activeShipments = await this.shippingTrackingService.getActiveShipments();
    
    for (const shipment of activeShipments) {
      await this.shippingQueue.add('update-tracking', {
        trackingNumber: shipment.trackingNumber,
        providerId: shipment.providerId
      }, {
        delay: Math.random() * 60000 // Spread over 1 minute
      });
    }
  }
  
  private async handleStatusChange(trackingNumber: string, fromStatus: ShippingStatus, toStatus: ShippingStatus): Promise<void> {
    const shipment = await this.shippingTrackingService.getByTrackingNumber(trackingNumber);
    
    // Update order status
    if (toStatus === ShippingStatus.DELIVERED) {
      await this.orderService.updateOrderStatus(shipment.order.id, OrderStatus.DELIVERED);
      await this.emailService.sendDeliveryConfirmation(shipment.order.id);
    } else if (toStatus === ShippingStatus.FAILED || toStatus === ShippingStatus.RETURNED) {
      await this.orderService.updateOrderStatus(shipment.order.id, OrderStatus.DELIVERY_FAILED);
      await this.emailService.sendDeliveryFailureNotification(shipment.order.id);
    }
    
    // Send tracking update notification
    await this.notificationService.sendTrackingUpdate(shipment.order.userId, {
      trackingNumber,
      status: toStatus,
      orderNumber: shipment.order.orderNumber
    });
  }
}
```

## 10. Event System

### 10.1 Shipping Events

```typescript
export class ShippingEventService {
  
  @OnEvent('order.confirmed')
  async handleOrderConfirmed(event: OrderConfirmedEvent): Promise<void> {
    const order = event.order;
    
    // Check if auto-fulfillment is enabled
    if (this.configService.get('AUTO_FULFILLMENT_ENABLED')) {
      await this.shippingQueue.add('create-shipment', {
        orderId: order.id,
        shipmentData: await this.prepareShipmentData(order)
      });
    }
  }
  
  @OnEvent('shipment.created')
  async handleShipmentCreated(event: ShipmentCreatedEvent): Promise<void> {
    const { shipment, trackingNumber } = event;
    
    // Send shipping confirmation
    await this.emailService.sendShippingConfirmation(shipment.orderId, trackingNumber);
    
    // Start tracking monitoring
    await this.shippingQueue.add('update-tracking', {
      trackingNumber,
      providerId: shipment.providerId
    }, {
      delay: 3600000 // First check after 1 hour
    });
  }
  
  @OnEvent('shipment.delivered')
  async handleShipmentDelivered(event: ShipmentDeliveredEvent): Promise<void> {
    const { shipment, deliveryInfo } = event;
    
    // Update order status
    await this.orderService.updateOrderStatus(shipment.orderId, OrderStatus.DELIVERED);
    
    // Send delivery confirmation
    await this.emailService.sendDeliveryConfirmation(shipment.orderId, deliveryInfo);
    
    // Trigger review request
    await this.reviewService.scheduleReviewRequest(shipment.orderId);
  }
  
  @OnEvent('shipment.failed')
  async handleShipmentFailed(event: ShipmentFailedEvent): Promise<void> {
    const { shipment, failureReason } = event;
    
    // Check if retry is possible
    if (this.canRetryShipment(shipment)) {
      await this.scheduleShipmentRetry(shipment);
    } else {
      // Mark order as delivery failed
      await this.orderService.updateOrderStatus(shipment.orderId, OrderStatus.DELIVERY_FAILED);
      
      // Notify customer service team
      await this.notificationService.notifyCustomerService({
        type: 'delivery_failure',
        orderId: shipment.orderId,
        reason: failureReason
      });
    }
  }
}
```

## 11. Security & Authorization

### 11.1 Shipping Security

```typescript
@Injectable()
export class ShippingSecurityService {
  
  validateProviderApiKey(providerId: string, apiKey: string): boolean {
    const provider = this.getProviderConfig(providerId);
    return this.cryptoService.compareHashed(apiKey, provider.hashedApiKey);
  }
  
  encryptProviderCredentials(credentials: ProviderCredentials): EncryptedCredentials {
    return {
      apiKey: this.cryptoService.encrypt(credentials.apiKey),
      apiSecret: this.cryptoService.encrypt(credentials.apiSecret),
      shopId: credentials.shopId ? this.cryptoService.encrypt(credentials.shopId) : null
    };
  }
  
  decryptProviderCredentials(encryptedCredentials: EncryptedCredentials): ProviderCredentials {
    return {
      apiKey: this.cryptoService.decrypt(encryptedCredentials.apiKey),
      apiSecret: this.cryptoService.decrypt(encryptedCredentials.apiSecret),
      shopId: encryptedCredentials.shopId ? this.cryptoService.decrypt(encryptedCredentials.shopId) : null
    };
  }
  
  sanitizeTrackingData(trackingInfo: TrackingInfo): PublicTrackingInfo {
    return {
      trackingNumber: trackingInfo.trackingNumber,
      status: trackingInfo.status,
      estimatedDelivery: trackingInfo.estimatedDelivery,
      events: trackingInfo.events.map(event => ({
        timestamp: event.timestamp,
        status: event.status,
        location: event.location,
        description: event.description
      }))
      // Remove sensitive provider-specific data
    };
  }
}
```

## 12. Performance Optimization

### 12.1 Shipping Cache Service

```typescript
@Injectable()
export class ShippingCacheService {
  
  private readonly RATE_CACHE_TTL = 3600; // 1 hour
  private readonly ZONE_CACHE_TTL = 86400; // 24 hours
  
  async getCachedRates(cacheKey: string): Promise<ShippingQuote[] | null> {
    return await this.cacheManager.get(`shipping:rates:${cacheKey}`);
  }
  
  async cacheRates(cacheKey: string, rates: ShippingQuote[]): Promise<void> {
    await this.cacheManager.set(`shipping:rates:${cacheKey}`, rates, this.RATE_CACHE_TTL);
  }
  
  async getCachedZone(address: string): Promise<ShippingZone | null> {
    return await this.cacheManager.get(`shipping:zone:${address}`);
  }
  
  async cacheZone(address: string, zone: ShippingZone): Promise<void> {
    await this.cacheManager.set(`shipping:zone:${address}`, zone, this.ZONE_CACHE_TTL);
  }
  
  generateRateCacheKey(request: ShippingCalculationRequest): string {
    const hash = createHash('md5');
    hash.update(JSON.stringify({
      destination: request.destination,
      weight: request.weight,
      value: request.orderValue,
      dimensions: request.dimensions
    }));
    return hash.digest('hex');
  }
}
```

## 13. Error Handling

### 13.1 Custom Exceptions

```typescript
export class ShippingZoneNotFoundException extends BaseException {
  constructor(address: any) {
    super(`No shipping zone found for address: ${JSON.stringify(address)}`, 404);
  }
}

export class ShippingRateNotFoundException extends BaseException {
  constructor(methodId: string, zoneId: string, weight: number) {
    super(`No shipping rate found for method ${methodId}, zone ${zoneId}, weight ${weight}kg`, 404);
  }
}

export class ProviderApiException extends BaseException {
  constructor(providerId: string, operation: string, error: any) {
    super(`${providerId} API error during ${operation}: ${error.message}`, 502, { providerId, operation, originalError: error });
  }
}

export class ShipmentCreationException extends BaseException {
  constructor(providerId: string, reason: string) {
    super(`Failed to create shipment with provider ${providerId}: ${reason}`, 400);
  }
}
```

## 14. Monitoring & Analytics

### 14.1 Shipping Metrics

```typescript
@Injectable()
export class ShippingMetricsService {
  
  async getShippingAnalytics(dateRange: DateRange): Promise<ShippingAnalytics> {
    return {
      totalShipments: await this.getTotalShipments(dateRange),
      deliverySuccessRate: await this.getDeliverySuccessRate(dateRange),
      averageDeliveryTime: await this.getAverageDeliveryTime(dateRange),
      shippingCostAnalysis: await this.getShippingCostAnalysis(dateRange),
      providerPerformance: await this.getProviderPerformance(dateRange),
      popularShippingMethods: await this.getPopularShippingMethods(dateRange),
      geographicDistribution: await this.getGeographicDistribution(dateRange),
      failureReasons: await this.getFailureReasons(dateRange)
    };
  }
  
  async calculateProviderSLA(providerId: string, dateRange: DateRange): Promise<ProviderSLA> {
    const shipments = await this.getProviderShipments(providerId, dateRange);
    
    const onTimeDeliveries = shipments.filter(s => 
      s.actualDelivery && s.estimatedDelivery && 
      s.actualDelivery <= s.estimatedDelivery
    ).length;
    
    const completedShipments = shipments.filter(s => s.status === ShippingStatus.DELIVERED).length;
    
    return {
      providerId,
      totalShipments: shipments.length,
      completedShipments,
      onTimeDeliveries,
      onTimeRate: completedShipments > 0 ? onTimeDeliveries / completedShipments : 0,
      averageDeliveryTime: this.calculateAverageDeliveryTime(shipments),
      failureRate: this.calculateFailureRate(shipments)
    };
  }
}
```

## 15. Testing Strategy

### 15.1 Unit Tests

- Shipping calculation logic
- Provider API adapters
- Rate calculation accuracy
- Zone matching algorithms

### 15.2 Integration Tests

- Provider API integration
- Database operations
- Queue processing
- Event handling

### 15.3 E2E Tests

- Complete shipping workflow
- Multi-provider rate comparison
- Tracking updates
- Error handling scenarios

## 16. Future Enhancements

- Machine learning for delivery time prediction
- Dynamic pricing based on demand
- Carbon footprint calculation
- International shipping support
- Real-time rate shopping across providers
- Advanced routing optimization
- Delivery slot booking system
