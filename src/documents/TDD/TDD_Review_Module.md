# Technical Design Document - Review Management Module (BE.05)

## 1. Thông tin tài liệu

- **Module**: Review Management (BE.05)
- **Phiên bản**: 1.0
- **Ngày tạo**: 27/07/2025
- **Người viết**: Development Team
- **SRS Reference**: BE.05 - Quản lý Đánh giá và Bình luận

## 2. Tổng quan module

Module Review Management quản lý hệ thống đánh giá và bình luận sản phẩm, bao gồm kiểm duyệt, phân tích sentiment, và xây dựng hệ thống reputation cho sản phẩm và người dùng.

### 2.1 Chức năng chính

- **BE.05.1**: Quản lý đánh giá và bình luận sản phẩm
- **BE.05.2**: Hệ thống kiểm duyệt tự động và thủ công
- **BE.05.3**: Phân tích sentiment và quality scoring
- **BE.05.4**: Quản lý phản hồi từ admin/nhà bán
- **BE.05.5**: Báo cáo và thống kê review
- **BE.05.6**: Chống spam và fake reviews

## 3. Kiến trúc module

### 3.1 Cấu trúc thư mục

```
src/review/
├── review.controller.ts
├── review.service.ts
├── review.module.ts
├── entities/
│   ├── review.entity.ts
│   ├── review-reply.entity.ts
│   ├── review-image.entity.ts
│   ├── review-vote.entity.ts
│   └── review-report.entity.ts
├── dto/
│   ├── create-review.dto.ts
│   ├── update-review.dto.ts
│   ├── review-query.dto.ts
│   ├── review-moderation.dto.ts
│   └── review-analytics.dto.ts
├── services/
│   ├── review-moderation.service.ts
│   ├── review-analytics.service.ts
│   ├── review-sentiment.service.ts
│   └── review-spam-detection.service.ts
├── interfaces/
│   ├── review.interface.ts
│   ├── sentiment-analysis.interface.ts
│   └── moderation-result.interface.ts
├── enums/
│   ├── review-status.enum.ts
│   ├── review-type.enum.ts
│   └── moderation-action.enum.ts
├── guards/
│   ├── review-ownership.guard.ts
│   └── purchase-verification.guard.ts
└── review.providers.ts
```

### 3.2 Dependencies

- `@nestjs/common`: Controllers, Services
- `sequelize-typescript`: ORM entities
- `@nestjs/bull`: Background processing for moderation
- `sentiment`: Text sentiment analysis
- `compromise`: Natural language processing
- `@google-cloud/translate`: Language translation
- `sharp`: Image processing for review images

## 4. Database Design

### 4.1 Review Entity

```sql
CREATE TABLE tbl_review (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  order_item_id VARCHAR(36) NOT NULL, -- Verify purchase
  
  -- Review content
  rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT NOT NULL,
  
  -- Review metadata
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  review_type ENUM('product', 'service', 'delivery') DEFAULT 'product',
  
  -- Moderation
  status ENUM('pending', 'approved', 'rejected', 'flagged', 'hidden') DEFAULT 'pending',
  moderation_reason TEXT,
  moderated_by VARCHAR(36),
  moderated_at DATETIME NULL,
  
  -- Quality metrics
  sentiment_score DECIMAL(3,2), -- -1 to 1
  quality_score DECIMAL(3,2), -- 0 to 1
  helpfulness_score DECIMAL(5,2) DEFAULT 0,
  
  -- Engagement metrics
  helpful_votes INT DEFAULT 0,
  total_votes INT DEFAULT 0,
  reply_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  
  -- Spam detection
  spam_score DECIMAL(3,2) DEFAULT 0, -- 0 to 1
  spam_flags JSON, -- Array of detected spam indicators
  
  -- SEO and features
  is_featured BOOLEAN DEFAULT FALSE,
  is_verified_reviewer BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES tbl_user(id),
  FOREIGN KEY (product_id) REFERENCES tbl_product(id),
  FOREIGN KEY (order_item_id) REFERENCES tbl_order_item(id),
  FOREIGN KEY (moderated_by) REFERENCES tbl_user(id),
  
  INDEX idx_product_id (product_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_rating (rating),
  INDEX idx_created_at (created_at),
  INDEX idx_helpfulness_score (helpfulness_score),
  INDEX idx_is_featured (is_featured),
  
  UNIQUE KEY unique_user_order_item (user_id, order_item_id)
);
```

### 4.2 Review Reply Entity

```sql
CREATE TABLE tbl_review_reply (
  id VARCHAR(36) PRIMARY KEY,
  review_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  parent_reply_id VARCHAR(36) NULL, -- For nested replies
  
  content TEXT NOT NULL,
  
  -- Reply metadata
  reply_type ENUM('customer', 'seller', 'admin') DEFAULT 'customer',
  is_official BOOLEAN DEFAULT FALSE, -- Official seller/admin response
  
  -- Moderation
  status ENUM('pending', 'approved', 'rejected', 'hidden') DEFAULT 'approved',
  moderated_by VARCHAR(36),
  moderated_at DATETIME NULL,
  
  -- Engagement
  helpful_votes INT DEFAULT 0,
  total_votes INT DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (review_id) REFERENCES tbl_review(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES tbl_user(id),
  FOREIGN KEY (parent_reply_id) REFERENCES tbl_review_reply(id),
  FOREIGN KEY (moderated_by) REFERENCES tbl_user(id),
  
  INDEX idx_review_id (review_id),
  INDEX idx_user_id (user_id),
  INDEX idx_parent_reply_id (parent_reply_id),
  INDEX idx_created_at (created_at)
);
```

### 4.3 Review Image Entity

```sql
CREATE TABLE tbl_review_image (
  id VARCHAR(36) PRIMARY KEY,
  review_id VARCHAR(36) NOT NULL,
  
  original_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  compressed_url VARCHAR(500),
  
  file_size INT, -- bytes
  width INT,
  height INT,
  format VARCHAR(10), -- jpg, png, webp
  
  alt_text VARCHAR(255),
  display_order INT DEFAULT 0,
  
  -- Moderation
  is_approved BOOLEAN DEFAULT TRUE,
  moderation_flags JSON, -- Array of detected issues
  
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (review_id) REFERENCES tbl_review(id) ON DELETE CASCADE,
  INDEX idx_review_id (review_id),
  INDEX idx_display_order (display_order)
);
```

### 4.4 Review Vote Entity

```sql
CREATE TABLE tbl_review_vote (
  id VARCHAR(36) PRIMARY KEY,
  review_id VARCHAR(36) NULL,
  reply_id VARCHAR(36) NULL,
  user_id VARCHAR(36) NOT NULL,
  
  vote_type ENUM('helpful', 'not_helpful') NOT NULL,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (review_id) REFERENCES tbl_review(id) ON DELETE CASCADE,
  FOREIGN KEY (reply_id) REFERENCES tbl_review_reply(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES tbl_user(id),
  
  INDEX idx_review_id (review_id),
  INDEX idx_reply_id (reply_id),
  INDEX idx_user_id (user_id),
  
  UNIQUE KEY unique_user_review_vote (user_id, review_id),
  UNIQUE KEY unique_user_reply_vote (user_id, reply_id),
  
  CONSTRAINT check_review_or_reply CHECK (
    (review_id IS NOT NULL AND reply_id IS NULL) OR 
    (review_id IS NULL AND reply_id IS NOT NULL)
  )
);
```

### 4.5 Review Report Entity

```sql
CREATE TABLE tbl_review_report (
  id VARCHAR(36) PRIMARY KEY,
  review_id VARCHAR(36) NULL,
  reply_id VARCHAR(36) NULL,
  reported_by VARCHAR(36) NOT NULL,
  
  report_type ENUM('spam', 'inappropriate', 'fake', 'harassment', 'copyright', 'other') NOT NULL,
  description TEXT,
  
  status ENUM('pending', 'reviewed', 'resolved', 'dismissed') DEFAULT 'pending',
  admin_notes TEXT,
  resolved_by VARCHAR(36),
  resolved_at DATETIME NULL,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (review_id) REFERENCES tbl_review(id) ON DELETE CASCADE,
  FOREIGN KEY (reply_id) REFERENCES tbl_review_reply(id) ON DELETE CASCADE,
  FOREIGN KEY (reported_by) REFERENCES tbl_user(id),
  FOREIGN KEY (resolved_by) REFERENCES tbl_user(id),
  
  INDEX idx_review_id (review_id),
  INDEX idx_reply_id (reply_id),
  INDEX idx_reported_by (reported_by),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  
  CONSTRAINT check_review_or_reply_report CHECK (
    (review_id IS NOT NULL AND reply_id IS NULL) OR 
    (review_id IS NULL AND reply_id IS NOT NULL)
  )
);
```

## 5. API Endpoints

### 5.1 Public Review Controller

```typescript
@Controller('reviews')
@ApiTags('reviews')
export class ReviewController {
  
  @Post()
  @ApiOperation({ summary: 'Create product review' })
  @UseGuards(JwtAuthGuard, PurchaseVerificationGuard)
  async createReview(@Body() createReviewDto: CreateReviewDto, @Request() req): Promise<ReviewDto>

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get product reviews with pagination' })
  async getProductReviews(@Param('productId') productId: string, @Query() queryDto: ReviewQueryDto): Promise<PaginatedReviewDto>

  @Get(':id')
  @ApiOperation({ summary: 'Get review details' })
  async getReview(@Param('id') id: string): Promise<ReviewDetailDto>

  @Put(':id')
  @ApiOperation({ summary: 'Update review' })
  @UseGuards(JwtAuthGuard, ReviewOwnershipGuard)
  async updateReview(@Param('id') id: string, @Body() updateDto: UpdateReviewDto): Promise<ReviewDto>

  @Delete(':id')
  @ApiOperation({ summary: 'Delete review' })
  @UseGuards(JwtAuthGuard, ReviewOwnershipGuard)
  async deleteReview(@Param('id') id: string): Promise<void>

  @Post(':id/vote')
  @ApiOperation({ summary: 'Vote on review helpfulness' })
  @UseGuards(JwtAuthGuard)
  async voteReview(@Param('id') id: string, @Body() voteDto: VoteReviewDto, @Request() req): Promise<VoteResultDto>

  @Post(':id/reply')
  @ApiOperation({ summary: 'Reply to review' })
  @UseGuards(JwtAuthGuard)
  async replyToReview(@Param('id') id: string, @Body() replyDto: CreateReplyDto, @Request() req): Promise<ReviewReplyDto>

  @Post(':id/report')
  @ApiOperation({ summary: 'Report review' })
  @UseGuards(JwtAuthGuard)
  async reportReview(@Param('id') id: string, @Body() reportDto: ReportReviewDto, @Request() req): Promise<ReportResultDto>

  @Post('upload-images')
  @ApiOperation({ summary: 'Upload review images' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 5))
  async uploadReviewImages(@UploadedFiles() files: Express.Multer.File[]): Promise<UploadResultDto>

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user reviews' })
  async getUserReviews(@Param('userId') userId: string, @Query() queryDto: ReviewQueryDto): Promise<PaginatedReviewDto>
}
```

### 5.2 Admin Review Controller

```typescript
@Controller('admin/reviews')
@ApiTags('admin-reviews')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminReviewController {
  
  @Get()
  @ApiOperation({ summary: 'Get all reviews with admin filters' })
  async getAllReviews(@Query() queryDto: AdminReviewQueryDto): Promise<PaginatedReviewDto>

  @Get('pending')
  @ApiOperation({ summary: 'Get pending reviews for moderation' })
  async getPendingReviews(@Query() queryDto: ModerationQueryDto): Promise<PaginatedReviewDto>

  @Put(':id/moderate')
  @ApiOperation({ summary: 'Moderate review' })
  async moderateReview(@Param('id') id: string, @Body() moderationDto: ModerationDto): Promise<ReviewDto>

  @Put(':id/feature')
  @ApiOperation({ summary: 'Feature/unfeature review' })
  async featureReview(@Param('id') id: string, @Body() featureDto: FeatureReviewDto): Promise<ReviewDto>

  @Get('analytics')
  @ApiOperation({ summary: 'Get review analytics' })
  async getReviewAnalytics(@Query() analyticsDto: AnalyticsQueryDto): Promise<ReviewAnalyticsDto>

  @Get('reports')
  @ApiOperation({ summary: 'Get review reports' })
  async getReviewReports(@Query() queryDto: ReportQueryDto): Promise<PaginatedReportDto>

  @Put('reports/:id/resolve')
  @ApiOperation({ summary: 'Resolve review report' })
  async resolveReport(@Param('id') id: string, @Body() resolveDto: ResolveReportDto): Promise<ReportDto>

  @Post('bulk-moderate')
  @ApiOperation({ summary: 'Bulk moderate reviews' })
  async bulkModerateReviews(@Body() bulkDto: BulkModerationDto): Promise<BulkModerationResultDto>

  @Get('export')
  @ApiOperation({ summary: 'Export review data' })
  async exportReviews(@Query() exportDto: ReviewExportDto, @Res() response: Response): Promise<void>
}
```

## 6. Business Logic

### 6.1 Review Service Core Methods

```typescript
@Injectable()
export class ReviewService {
  
  // Review management
  async createReview(reviewData: CreateReviewDto, userId: string): Promise<Review>
  async updateReview(reviewId: string, updateData: UpdateReviewDto): Promise<Review>
  async deleteReview(reviewId: string): Promise<void>
  async getReview(reviewId: string): Promise<Review>

  // Product reviews
  async getProductReviews(productId: string, queryDto: ReviewQueryDto): Promise<PaginatedResult<Review>>
  async getProductReviewSummary(productId: string): Promise<ReviewSummary>
  async calculateProductRating(productId: string): Promise<ProductRating>

  // User reviews
  async getUserReviews(userId: string, queryDto: ReviewQueryDto): Promise<PaginatedResult<Review>>
  async canUserReviewProduct(userId: string, productId: string): Promise<boolean>
  async getUserReviewForProduct(userId: string, productId: string): Promise<Review | null>

  // Review voting
  async voteReview(reviewId: string, userId: string, voteType: VoteType): Promise<VoteResult>
  async getReviewVotes(reviewId: string): Promise<ReviewVotes>
  async updateReviewHelpfulness(reviewId: string): Promise<void>

  // Review replies
  async addReviewReply(reviewId: string, replyData: CreateReplyDto, userId: string): Promise<ReviewReply>
  async getReviewReplies(reviewId: string): Promise<ReviewReply[]>
  async updateReplyCount(reviewId: string): Promise<void>

  // Moderation
  async moderateReview(reviewId: string, moderationData: ModerationDto): Promise<Review>
  async bulkModerateReviews(reviewIds: string[], action: ModerationAction): Promise<BulkModerationResult>
  async flagReviewForModeration(reviewId: string, reason: string): Promise<void>

  // Analytics
  async getReviewAnalytics(filters: AnalyticsFilters): Promise<ReviewAnalytics>
  async generateReviewInsights(productId: string): Promise<ReviewInsights>
  async getReviewTrends(timeRange: TimeRange): Promise<ReviewTrends>
}
```

### 6.2 Review Moderation Service

```typescript
@Injectable()
export class ReviewModerationService {
  
  async autoModerateReview(review: Review): Promise<ModerationResult> {
    const checks: ModerationCheck[] = [];
    
    // Spam detection
    const spamScore = await this.spamDetectionService.analyzeReview(review);
    checks.push({
      type: 'spam',
      score: spamScore,
      passed: spamScore < 0.7
    });
    
    // Sentiment analysis
    const sentiment = await this.sentimentService.analyzeText(review.content);
    checks.push({
      type: 'sentiment',
      score: sentiment.score,
      passed: sentiment.score > -0.8 // Not extremely negative
    });
    
    // Content quality
    const qualityScore = await this.analyzeContentQuality(review);
    checks.push({
      type: 'quality',
      score: qualityScore,
      passed: qualityScore > 0.3
    });
    
    // Profanity check
    const hasProfanity = await this.checkProfanity(review.content);
    checks.push({
      type: 'profanity',
      score: hasProfanity ? 1 : 0,
      passed: !hasProfanity
    });
    
    // Length check
    const hasMinLength = review.content.length >= 10;
    checks.push({
      type: 'length',
      score: hasMinLength ? 1 : 0,
      passed: hasMinLength
    });
    
    // Determine overall result
    const failedChecks = checks.filter(check => !check.passed);
    let recommendation: ModerationRecommendation;
    
    if (failedChecks.length === 0) {
      recommendation = ModerationRecommendation.APPROVE;
    } else if (failedChecks.some(check => ['spam', 'profanity'].includes(check.type))) {
      recommendation = ModerationRecommendation.REJECT;
    } else {
      recommendation = ModerationRecommendation.FLAG;
    }
    
    return {
      recommendation,
      confidence: this.calculateConfidence(checks),
      checks,
      reasons: failedChecks.map(check => check.type)
    };
  }
  
  async analyzeContentQuality(review: Review): Promise<number> {
    let qualityScore = 0;
    
    // Length factor (0.2 weight)
    const lengthScore = Math.min(review.content.length / 100, 1);
    qualityScore += lengthScore * 0.2;
    
    // Word count factor (0.2 weight)
    const wordCount = review.content.split(/\s+/).length;
    const wordScore = Math.min(wordCount / 20, 1);
    qualityScore += wordScore * 0.2;
    
    // Grammar and spelling (0.3 weight)
    const grammarScore = await this.checkGrammar(review.content);
    qualityScore += grammarScore * 0.3;
    
    // Relevance to product (0.3 weight)
    const relevanceScore = await this.checkRelevance(review);
    qualityScore += relevanceScore * 0.3;
    
    return Math.min(qualityScore, 1);
  }
  
  async detectFakeReview(review: Review): Promise<FakeReviewAnalysis> {
    const indicators: FakeIndicator[] = [];
    
    // Check review patterns
    const userReviews = await this.getUserRecentReviews(review.userId);
    
    // Multiple reviews in short time
    if (userReviews.length > 5) {
      const recentReviews = userReviews.filter(r => 
        (Date.now() - r.createdAt.getTime()) < 24 * 60 * 60 * 1000
      );
      if (recentReviews.length > 3) {
        indicators.push({
          type: 'burst_reviewing',
          severity: 'high',
          description: 'Multiple reviews in 24 hours'
        });
      }
    }
    
    // Generic content detection
    const genericScore = await this.detectGenericContent(review.content);
    if (genericScore > 0.8) {
      indicators.push({
        type: 'generic_content',
        severity: 'medium',
        description: 'Review content appears generic'
      });
    }
    
    // Extreme rating with short content
    if ((review.rating === 1 || review.rating === 5) && review.content.length < 20) {
      indicators.push({
        type: 'extreme_rating_short_content',
        severity: 'medium',
        description: 'Extreme rating with minimal content'
      });
    }
    
    // Calculate fake probability
    const fakeProbability = this.calculateFakeProbability(indicators);
    
    return {
      indicators,
      fakeProbability,
      isSuspicious: fakeProbability > 0.6,
      requiresManualReview: fakeProbability > 0.4
    };
  }
}
```

### 6.3 Review Analytics Service

```typescript
@Injectable()
export class ReviewAnalyticsService {
  
  async getProductReviewInsights(productId: string): Promise<ProductReviewInsights> {
    const reviews = await this.getProductReviews(productId);
    
    return {
      totalReviews: reviews.length,
      averageRating: this.calculateAverageRating(reviews),
      ratingDistribution: this.getRatingDistribution(reviews),
      sentimentAnalysis: await this.analyzeSentimentDistribution(reviews),
      topKeywords: await this.extractTopKeywords(reviews),
      topComplaints: await this.extractComplaints(reviews),
      topPraises: await this.extractPraises(reviews),
      reviewVelocity: await this.calculateReviewVelocity(productId),
      qualityMetrics: this.calculateQualityMetrics(reviews),
      moderationStats: this.getModerationStats(reviews)
    };
  }
  
  async extractTopKeywords(reviews: Review[]): Promise<KeywordAnalysis[]> {
    const allText = reviews.map(r => r.content).join(' ');
    const doc = nlp(allText);
    
    // Extract nouns and adjectives
    const nouns = doc.nouns().out('freq');
    const adjectives = doc.adjectives().out('freq');
    
    // Combine and sort by frequency
    const keywords = [...nouns, ...adjectives]
      .filter(item => item.count > 2 && item.normal.length > 3)
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
    
    return keywords.map(keyword => ({
      word: keyword.normal,
      frequency: keyword.count,
      sentiment: await this.getWordSentiment(keyword.normal),
      category: this.categorizeKeyword(keyword.normal)
    }));
  }
  
  async generateReviewSummary(productId: string): Promise<ReviewSummary> {
    const insights = await this.getProductReviewInsights(productId);
    const reviews = await this.getProductReviews(productId);
    
    // Generate AI-powered summary
    const positiveSummary = await this.generateSummaryForSentiment(reviews, 'positive');
    const negativeSummary = await this.generateSummaryForSentiment(reviews, 'negative');
    
    return {
      overallRating: insights.averageRating,
      totalReviews: insights.totalReviews,
      positiveHighlights: positiveSummary.highlights,
      negativeHighlights: negativeSummary.highlights,
      commonIssues: insights.topComplaints.slice(0, 5),
      strengths: insights.topPraises.slice(0, 5),
      recommendation: this.generateRecommendation(insights),
      lastUpdated: new Date()
    };
  }
  
  async trackReviewTrends(timeRange: TimeRange): Promise<ReviewTrends> {
    const reviews = await this.getReviewsInTimeRange(timeRange);
    const groupedByDate = this.groupReviewsByDate(reviews, timeRange.granularity);
    
    return {
      reviewVolume: this.calculateVolumeMetrics(groupedByDate),
      averageRating: this.calculateRatingTrends(groupedByDate),
      sentimentTrends: this.calculateSentimentTrends(groupedByDate),
      topProducts: await this.getTopReviewedProducts(timeRange),
      moderationStats: this.calculateModerationTrends(groupedByDate),
      qualityTrends: this.calculateQualityTrends(groupedByDate)
    };
  }
}
```

## 7. Data Transfer Objects (DTOs)

### 7.1 Review DTOs

```typescript
export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  orderItemId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(5000)
  content: string;

  @IsOptional()
  @IsEnum(ReviewType)
  reviewType?: ReviewType = ReviewType.PRODUCT;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageIds?: string[];
}

export class ReviewDto {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  productId: string;
  productName: string;
  orderItemId: string;
  
  rating: number;
  title?: string;
  content: string;
  reviewType: ReviewType;
  
  isVerifiedPurchase: boolean;
  isVerifiedReviewer: boolean;
  isFeatured: boolean;
  
  status: ReviewStatus;
  
  sentimentScore?: number;
  qualityScore?: number;
  helpfulnessScore: number;
  
  helpfulVotes: number;
  totalVotes: number;
  replyCount: number;
  viewCount: number;
  
  images: ReviewImageDto[];
  replies: ReviewReplyDto[];
  
  createdAt: Date;
  updatedAt: Date;
}

export class ReviewSummaryDto {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    [key: number]: number; // 1-5 stars
  };
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  hasUserReviewed: boolean;
  userReview?: ReviewDto;
  featuredReviews: ReviewDto[];
  recentReviews: ReviewDto[];
}
```

### 7.2 Moderation DTOs

```typescript
export class ModerationDto {
  @IsEnum(ModerationAction)
  action: ModerationAction;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;

  @IsOptional()
  @IsBoolean()
  notifyUser?: boolean = true;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  moderationFlags?: string[];
}

export class ModerationResultDto {
  reviewId: string;
  action: ModerationAction;
  moderatedBy: string;
  moderatedAt: Date;
  reason?: string;
  autoModerated: boolean;
  confidence: number;
  flags: string[];
}

export class BulkModerationDto {
  @IsArray()
  @IsString({ each: true })
  reviewIds: string[];

  @IsEnum(ModerationAction)
  action: ModerationAction;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsBoolean()
  notifyUsers?: boolean = false;
}
```

### 7.3 Analytics DTOs

```typescript
export class ReviewAnalyticsDto {
  overview: {
    totalReviews: number;
    averageRating: number;
    reviewsToday: number;
    pendingReviews: number;
    approvalRate: number;
  };
  
  ratingDistribution: {
    [key: number]: number;
  };
  
  sentimentAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
    averageSentiment: number;
  };
  
  qualityMetrics: {
    averageQuality: number;
    highQualityReviews: number;
    lowQualityReviews: number;
  };
  
  moderationStats: {
    autoApproved: number;
    manuallyApproved: number;
    rejected: number;
    flagged: number;
    reported: number;
  };
  
  topProducts: ProductReviewStatsDto[];
  trends: ReviewTrendDto[];
  keywords: KeywordAnalysisDto[];
  
  timeRange: {
    from: Date;
    to: Date;
  };
}

export interface ProductReviewStatsDto {
  productId: string;
  productName: string;
  totalReviews: number;
  averageRating: number;
  sentiment: number;
  growthRate: number;
}
```

## 8. Business Rules

### 8.1 Review Validation Rules

```typescript
export class ReviewBusinessRules {
  
  static readonly MIN_REVIEW_LENGTH = 10;
  static readonly MAX_REVIEW_LENGTH = 5000;
  static readonly MAX_IMAGES_PER_REVIEW = 5;
  static readonly REVIEW_EDIT_TIME_LIMIT = 24; // hours
  
  static canUserReview(user: User, orderItem: OrderItem): ValidationResult {
    // Must be verified purchase
    if (orderItem.order.userId !== user.id) {
      throw new ReviewValidationException('Can only review purchased products');
    }
    
    // Order must be delivered
    if (orderItem.order.status !== OrderStatus.DELIVERED) {
      throw new ReviewValidationException('Can only review delivered orders');
    }
    
    // Check if already reviewed
    const existingReview = orderItem.reviews.find(r => r.userId === user.id);
    if (existingReview) {
      throw new ReviewValidationException('Product already reviewed');
    }
    
    // Time limit for review (optional)
    const daysSinceDelivery = (Date.now() - orderItem.order.deliveredAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceDelivery > 90) {
      throw new ReviewValidationException('Review period has expired');
    }
    
    return { valid: true };
  }
  
  static canEditReview(review: Review, user: User): ValidationResult {
    // Only owner can edit
    if (review.userId !== user.id) {
      throw new ReviewValidationException('Can only edit own reviews');
    }
    
    // Time limit for editing
    const hoursSinceCreation = (Date.now() - review.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation > this.REVIEW_EDIT_TIME_LIMIT) {
      throw new ReviewValidationException('Review edit period has expired');
    }
    
    // Cannot edit if already moderated
    if (review.status === ReviewStatus.REJECTED) {
      throw new ReviewValidationException('Cannot edit rejected review');
    }
    
    return { valid: true };
  }
  
  static calculateReviewScore(review: Review): number {
    let score = 0;
    
    // Base score from rating (30%)
    score += (review.rating / 5) * 0.3;
    
    // Quality score (25%)
    score += (review.qualityScore || 0) * 0.25;
    
    // Helpfulness (20%)
    const helpfulnessRatio = review.totalVotes > 0 ? review.helpfulVotes / review.totalVotes : 0;
    score += helpfulnessRatio * 0.2;
    
    // Verified purchase bonus (15%)
    if (review.isVerifiedPurchase) {
      score += 0.15;
    }
    
    // Content length factor (10%)
    const lengthScore = Math.min(review.content.length / 200, 1);
    score += lengthScore * 0.1;
    
    return Math.min(score, 1);
  }
  
  static shouldAutoApprove(moderationResult: ModerationResult): boolean {
    return moderationResult.recommendation === ModerationRecommendation.APPROVE && 
           moderationResult.confidence > 0.8;
  }
}
```

## 9. Background Processing

### 9.1 Review Processor

```typescript
@Processor('review-processing')
export class ReviewProcessor {
  
  @Process('moderate-review')
  async moderateReview(job: Job<{ reviewId: string }>): Promise<void> {
    const { reviewId } = job.data;
    
    try {
      const review = await this.reviewService.getReview(reviewId);
      
      // Auto-moderation
      const moderationResult = await this.moderationService.autoModerateReview(review);
      
      // Update review with moderation result
      await this.reviewService.updateReviewModeration(reviewId, moderationResult);
      
      // Auto-approve if confidence is high
      if (ReviewBusinessRules.shouldAutoApprove(moderationResult)) {
        await this.reviewService.approveReview(reviewId, 'system');
      } else if (moderationResult.recommendation === ModerationRecommendation.REJECT) {
        await this.reviewService.rejectReview(reviewId, 'system', moderationResult.reasons.join(', '));
      }
      
      // Update product rating
      await this.productService.updateProductRating(review.productId);
      
    } catch (error) {
      this.logger.error(`Failed to moderate review ${reviewId}`, error);
      throw error;
    }
  }
  
  @Process('analyze-sentiment')
  async analyzeSentiment(job: Job<{ reviewId: string }>): Promise<void> {
    const { reviewId } = job.data;
    
    const review = await this.reviewService.getReview(reviewId);
    const sentiment = await this.sentimentService.analyzeText(review.content);
    
    await this.reviewService.updateReviewSentiment(reviewId, sentiment);
  }
  
  @Process('detect-fake-review')
  async detectFakeReview(job: Job<{ reviewId: string }>): Promise<void> {
    const { reviewId } = job.data;
    
    const review = await this.reviewService.getReview(reviewId);
    const fakeAnalysis = await this.moderationService.detectFakeReview(review);
    
    if (fakeAnalysis.isSuspicious) {
      await this.reviewService.flagReviewForModeration(reviewId, 'Potential fake review detected');
    }
    
    await this.reviewService.updateFakeScore(reviewId, fakeAnalysis.fakeProbability);
  }
  
  @Cron('0 1 * * *') // Daily at 1 AM
  async dailyReviewMaintenance(): Promise<void> {
    // Update helpfulness scores
    await this.updateAllHelpfulnessScores();
    
    // Recalculate product ratings
    await this.recalculateProductRatings();
    
    // Clean up old pending reviews
    await this.cleanupOldPendingReviews();
    
    // Generate daily analytics
    await this.generateDailyAnalytics();
  }
}
```

## 10. Event System

### 10.1 Review Events

```typescript
export class ReviewEventService {
  
  @OnEvent('review.created')
  async handleReviewCreated(event: ReviewCreatedEvent): Promise<void> {
    const { review } = event;
    
    // Queue for moderation
    await this.reviewQueue.add('moderate-review', { reviewId: review.id });
    
    // Queue for sentiment analysis
    await this.reviewQueue.add('analyze-sentiment', { reviewId: review.id });
    
    // Queue for fake detection
    await this.reviewQueue.add('detect-fake-review', { reviewId: review.id });
    
    // Send notification to product owner (if applicable)
    await this.notificationService.notifyProductOwner(review.productId, 'new_review');
  }
  
  @OnEvent('review.approved')
  async handleReviewApproved(event: ReviewApprovedEvent): Promise<void> {
    const { review } = event;
    
    // Update product rating
    await this.productService.updateProductRating(review.productId);
    
    // Send notification to reviewer
    await this.emailService.sendReviewApprovedEmail(review.userId, review.id);
    
    // Update user review count
    await this.userService.incrementReviewCount(review.userId);
    
    // Check for review milestones
    await this.checkReviewMilestones(review.userId);
  }
  
  @OnEvent('review.rejected')
  async handleReviewRejected(event: ReviewRejectedEvent): Promise<void> {
    const { review, reason } = event;
    
    // Send notification to reviewer with reason
    await this.emailService.sendReviewRejectedEmail(review.userId, review.id, reason);
    
    // Log rejection for analytics
    await this.analyticsService.logReviewRejection(review.id, reason);
  }
  
  @OnEvent('review.reported')
  async handleReviewReported(event: ReviewReportedEvent): Promise<void> {
    const { report } = event;
    
    // Auto-hide if multiple reports
    const reportCount = await this.reportService.getReviewReportCount(report.reviewId);
    if (reportCount >= 3) {
      await this.reviewService.hideReview(report.reviewId, 'Multiple reports received');
    }
    
    // Notify moderators
    await this.notificationService.notifyModerators('review_reported', {
      reviewId: report.reviewId,
      reportType: report.reportType
    });
  }
}
```

## 11. Security & Authorization

### 11.1 Review Security

```typescript
@Injectable()
export class ReviewSecurityService {
  
  sanitizeReviewContent(content: string): string {
    // Remove HTML tags
    let sanitized = content.replace(/<[^>]*>/g, '');
    
    // Remove URLs
    sanitized = sanitized.replace(/https?:\/\/[^\s]+/g, '[URL]');
    
    // Remove email addresses
    sanitized = sanitized.replace(/\S+@\S+\.\S+/g, '[EMAIL]');
    
    // Remove phone numbers
    sanitized = sanitized.replace(/\d{10,}/g, '[PHONE]');
    
    return sanitized.trim();
  }
  
  validateReviewImages(files: Express.Multer.File[]): ValidationResult {
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    for (const file of files) {
      if (file.size > maxFileSize) {
        throw new ReviewValidationException(`Image file size exceeds ${maxFileSize / 1024 / 1024}MB limit`);
      }
      
      if (!allowedTypes.includes(file.mimetype)) {
        throw new ReviewValidationException(`Unsupported image type: ${file.mimetype}`);
      }
    }
    
    return { valid: true };
  }
  
  checkRateLimiting(userId: string): Promise<boolean> {
    // Check if user has exceeded review creation rate limit
    return this.rateLimitService.checkLimit(`review:create:${userId}`, 5, 3600); // 5 reviews per hour
  }
  
  detectSuspiciousActivity(userId: string): Promise<SuspiciousActivityReport> {
    // Check for patterns indicating suspicious behavior
    return this.suspiciousActivityService.analyzeUser(userId, 'review_activity');
  }
}
```

## 12. Performance Optimization

### 12.1 Review Cache Service

```typescript
@Injectable()
export class ReviewCacheService {
  
  private readonly REVIEW_CACHE_TTL = 3600; // 1 hour
  private readonly SUMMARY_CACHE_TTL = 1800; // 30 minutes
  
  async getCachedProductReviews(productId: string, page: number, limit: number): Promise<PaginatedResult<Review> | null> {
    const cacheKey = `product:reviews:${productId}:${page}:${limit}`;
    return await this.cacheManager.get(cacheKey);
  }
  
  async cacheProductReviews(productId: string, page: number, limit: number, reviews: PaginatedResult<Review>): Promise<void> {
    const cacheKey = `product:reviews:${productId}:${page}:${limit}`;
    await this.cacheManager.set(cacheKey, reviews, this.REVIEW_CACHE_TTL);
  }
  
  async getCachedReviewSummary(productId: string): Promise<ReviewSummary | null> {
    const cacheKey = `product:review:summary:${productId}`;
    return await this.cacheManager.get(cacheKey);
  }
  
  async cacheReviewSummary(productId: string, summary: ReviewSummary): Promise<void> {
    const cacheKey = `product:review:summary:${productId}`;
    await this.cacheManager.set(cacheKey, summary, this.SUMMARY_CACHE_TTL);
  }
  
  async invalidateProductReviewCache(productId: string): Promise<void> {
    const patterns = [
      `product:reviews:${productId}:*`,
      `product:review:summary:${productId}`
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
export class ReviewValidationException extends BaseException {
  constructor(message: string) {
    super(message, 400);
  }
}

export class ReviewNotFoundException extends BaseException {
  constructor(reviewId: string) {
    super(`Review with ID ${reviewId} not found`, 404);
  }
}

export class ReviewModerationException extends BaseException {
  constructor(message: string) {
    super(message, 422);
  }
}

export class DuplicateReviewException extends BaseException {
  constructor(userId: string, productId: string) {
    super(`User ${userId} has already reviewed product ${productId}`, 409);
  }
}
```

## 14. Monitoring & Analytics

### 14.1 Review Metrics

```typescript
@Injectable()
export class ReviewMetricsService {
  
  async getReviewHealthMetrics(): Promise<ReviewHealthMetrics> {
    const last30Days = this.getLast30Days();
    
    return {
      totalReviews: await this.getTotalReviews(),
      averageRating: await this.getOverallAverageRating(),
      reviewVelocity: await this.getReviewVelocity(last30Days),
      approvalRate: await this.getApprovalRate(last30Days),
      qualityScore: await this.getAverageQualityScore(),
      moderationEfficiency: await this.getModerationEfficiency(),
      fakeReviewDetectionRate: await this.getFakeDetectionRate(),
      userEngagement: await this.getUserEngagementMetrics()
    };
  }
  
  async generateReviewReport(reportType: ReportType, filters: ReportFilters): Promise<ReviewReport> {
    switch (reportType) {
      case ReportType.PRODUCT_PERFORMANCE:
        return this.generateProductPerformanceReport(filters);
      case ReportType.USER_ACTIVITY:
        return this.generateUserActivityReport(filters);
      case ReportType.MODERATION_SUMMARY:
        return this.generateModerationSummaryReport(filters);
      default:
        throw new Error('Unsupported report type');
    }
  }
}
```

## 15. Testing Strategy

### 15.1 Unit Tests

- Review business logic
- Moderation algorithms
- Sentiment analysis
- Spam detection
- Content quality scoring

### 15.2 Integration Tests

- Review API endpoints
- Database operations
- Background processing
- Event handling
- External service integration

### 15.3 E2E Tests

- Complete review lifecycle
- Moderation workflows
- User review journey
- Admin management features

## 16. Future Enhancements

- AI-powered review summarization
- Video review support
- Review translation services
- Advanced fake review detection using ML
- Review recommendation system
- Integration with social media platforms
- Voice-to-text review input
- Advanced analytics dashboard
