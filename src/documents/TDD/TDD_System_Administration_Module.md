# Technical Design Document - System Administration Module (BE.06)

## 1. Thông tin tài liệu

- **Module**: System Administration (BE.06)
- **Phiên bản**: 1.0
- **Ngày tạo**: 27/07/2025
- **Người viết**: Development Team
- **SRS Reference**: BE.06 - Quản trị Hệ thống

## 2. Tổng quan module

Module System Administration cung cấp đầy đủ công cụ quản trị hệ thống, bao gồm quản lý người dùng nội bộ, phân quyền chi tiết, cấu hình hệ thống và quản lý nội dung trang tĩnh.

### 2.1 Chức năng chính

- **BE.06.1**: Quản lý tài khoản Admin/Nhân viên và phân quyền
- **BE.06.2**: Cấu hình hệ thống toàn cục
- **BE.06.3**: Quản lý nội dung trang tĩnh
- **BE.06.4**: Giám sát hoạt động hệ thống
- **BE.06.5**: Quản lý backup và khôi phục
- **BE.06.6**: Bảo mật và audit logs

## 3. Kiến trúc module

### 3.1 Cấu trúc thư mục

```
src/admin/
├── admin.controller.ts
├── admin.service.ts
├── admin.module.ts
├── entities/
│   ├── admin-user.entity.ts
│   ├── role.entity.ts
│   ├── permission.entity.ts
│   ├── system-config.entity.ts
│   ├── static-page.entity.ts
│   ├── audit-log.entity.ts
│   └── system-notification.entity.ts
├── dto/
│   ├── admin-user.dto.ts
│   ├── role-permission.dto.ts
│   ├── system-config.dto.ts
│   ├── static-page.dto.ts
│   └── audit-log.dto.ts
├── services/
│   ├── role-permission.service.ts
│   ├── system-config.service.ts
│   ├── static-page.service.ts
│   ├── audit-log.service.ts
│   ├── backup.service.ts
│   └── system-monitor.service.ts
├── interfaces/
│   ├── admin.interface.ts
│   ├── permission.interface.ts
│   ├── system-config.interface.ts
│   └── audit.interface.ts
├── enums/
│   ├── user-role.enum.ts
│   ├── permission.enum.ts
│   ├── config-type.enum.ts
│   └── audit-action.enum.ts
├── guards/
│   ├── admin.guard.ts
│   ├── permission.guard.ts
│   └── super-admin.guard.ts
├── decorators/
│   ├── permissions.decorator.ts
│   ├── audit-log.decorator.ts
│   └── rate-limit.decorator.ts
└── admin.providers.ts
```

### 3.2 Dependencies

- `@nestjs/common`: Controllers, Services
- `sequelize-typescript`: ORM entities
- `@nestjs/schedule`: Scheduled tasks
- `@nestjs/throttler`: Rate limiting
- `bcrypt`: Password hashing
- `node-cron`: System maintenance tasks
- `archiver`: Backup creation

## 4. Database Design

### 4.1 Admin User Entity

```sql
CREATE TABLE tbl_admin_user (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  
  -- Contact information
  phone_number VARCHAR(20),
  avatar_url VARCHAR(500),
  
  -- Status and security
  status ENUM('active', 'inactive', 'suspended', 'locked') DEFAULT 'active',
  is_super_admin BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret VARCHAR(255),
  
  -- Password security
  password_changed_at DATETIME,
  password_expires_at DATETIME,
  failed_login_attempts INT DEFAULT 0,
  locked_until DATETIME NULL,
  
  -- Activity tracking
  last_login_at DATETIME,
  last_login_ip VARCHAR(45),
  last_activity_at DATETIME,
  
  -- Metadata
  created_by VARCHAR(36),
  notes TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (created_by) REFERENCES tbl_admin_user(id),
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_last_login_at (last_login_at)
);
```

### 4.2 Role Entity

```sql
CREATE TABLE tbl_role (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Role hierarchy
  parent_role_id VARCHAR(36) NULL,
  level INT DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_system_role BOOLEAN DEFAULT FALSE, -- Cannot be deleted
  
  -- Metadata
  created_by VARCHAR(36),
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (parent_role_id) REFERENCES tbl_role(id),
  FOREIGN KEY (created_by) REFERENCES tbl_admin_user(id),
  INDEX idx_name (name),
  INDEX idx_parent_role_id (parent_role_id),
  INDEX idx_is_active (is_active)
);
```

### 4.3 Permission Entity

```sql
CREATE TABLE tbl_permission (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Permission categorization
  module VARCHAR(50) NOT NULL, -- product, order, customer, etc.
  action VARCHAR(50) NOT NULL, -- create, read, update, delete, manage
  resource VARCHAR(100), -- Specific resource if applicable
  
  -- Permission hierarchy
  parent_permission_id VARCHAR(36) NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_system_permission BOOLEAN DEFAULT FALSE,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (parent_permission_id) REFERENCES tbl_permission(id),
  INDEX idx_name (name),
  INDEX idx_module (module),
  INDEX idx_action (action),
  INDEX idx_parent_permission_id (parent_permission_id)
);
```

### 4.4 Admin User Role Assignment

```sql
CREATE TABLE tbl_admin_user_role (
  id VARCHAR(36) PRIMARY KEY,
  admin_user_id VARCHAR(36) NOT NULL,
  role_id VARCHAR(36) NOT NULL,
  
  -- Assignment metadata
  assigned_by VARCHAR(36) NOT NULL,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NULL,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Audit trail
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (admin_user_id) REFERENCES tbl_admin_user(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES tbl_role(id),
  FOREIGN KEY (assigned_by) REFERENCES tbl_admin_user(id),
  
  UNIQUE KEY unique_user_role_active (admin_user_id, role_id, is_active),
  INDEX idx_admin_user_id (admin_user_id),
  INDEX idx_role_id (role_id),
  INDEX idx_assigned_by (assigned_by)
);
```

### 4.5 Role Permission Assignment

```sql
CREATE TABLE tbl_role_permission (
  id VARCHAR(36) PRIMARY KEY,
  role_id VARCHAR(36) NOT NULL,
  permission_id VARCHAR(36) NOT NULL,
  
  -- Permission scope
  granted BOOLEAN DEFAULT TRUE, -- TRUE = grant, FALSE = deny
  conditions JSON, -- Additional conditions for permission
  
  -- Assignment metadata
  assigned_by VARCHAR(36) NOT NULL,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (role_id) REFERENCES tbl_role(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES tbl_permission(id),
  FOREIGN KEY (assigned_by) REFERENCES tbl_admin_user(id),
  
  UNIQUE KEY unique_role_permission (role_id, permission_id),
  INDEX idx_role_id (role_id),
  INDEX idx_permission_id (permission_id)
);
```

### 4.6 System Configuration Entity

```sql
CREATE TABLE tbl_system_config (
  id VARCHAR(36) PRIMARY KEY,
  config_key VARCHAR(255) UNIQUE NOT NULL,
  config_value TEXT,
  
  -- Configuration metadata
  config_type ENUM('string', 'number', 'boolean', 'json', 'encrypted') DEFAULT 'string',
  module VARCHAR(100), -- Which module this config belongs to
  category VARCHAR(100), -- General, Email, Payment, etc.
  
  -- Validation
  validation_rules JSON, -- Validation rules for the value
  default_value TEXT,
  
  -- Security and access
  is_sensitive BOOLEAN DEFAULT FALSE, -- Should be encrypted
  is_public BOOLEAN DEFAULT FALSE, -- Can be accessed by frontend
  requires_restart BOOLEAN DEFAULT FALSE, -- Requires system restart
  
  -- Metadata
  description TEXT,
  display_name VARCHAR(255),
  display_order INT DEFAULT 0,
  
  -- Audit
  last_modified_by VARCHAR(36),
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (last_modified_by) REFERENCES tbl_admin_user(id),
  INDEX idx_config_key (config_key),
  INDEX idx_module (module),
  INDEX idx_category (category),
  INDEX idx_is_public (is_public)
);
```

### 4.7 Static Page Entity

```sql
CREATE TABLE tbl_static_page (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content LONGTEXT,
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT,
  
  -- Page settings
  is_published BOOLEAN DEFAULT FALSE,
  is_indexable BOOLEAN DEFAULT TRUE,
  template VARCHAR(100) DEFAULT 'default',
  
  -- Navigation
  show_in_menu BOOLEAN DEFAULT FALSE,
  menu_order INT DEFAULT 0,
  parent_page_id VARCHAR(36) NULL,
  
  -- Content management
  language VARCHAR(5) DEFAULT 'vi',
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  
  -- Audit
  created_by VARCHAR(36) NOT NULL,
  last_modified_by VARCHAR(36),
  
  published_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (parent_page_id) REFERENCES tbl_static_page(id),
  FOREIGN KEY (created_by) REFERENCES tbl_admin_user(id),
  FOREIGN KEY (last_modified_by) REFERENCES tbl_admin_user(id),
  
  INDEX idx_slug (slug),
  INDEX idx_is_published (is_published),
  INDEX idx_show_in_menu (show_in_menu),
  INDEX idx_language (language),
  INDEX idx_status (status)
);
```

### 4.8 Audit Log Entity

```sql
CREATE TABLE tbl_audit_log (
  id VARCHAR(36) PRIMARY KEY,
  
  -- Action details
  action VARCHAR(100) NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, etc.
  entity_type VARCHAR(100), -- Product, Order, User, etc.
  entity_id VARCHAR(36),
  
  -- User information
  admin_user_id VARCHAR(36),
  user_id VARCHAR(36), -- If action was performed by regular user
  username VARCHAR(255),
  user_type ENUM('admin', 'customer', 'system') DEFAULT 'admin',
  
  -- Request details
  ip_address VARCHAR(45),
  user_agent TEXT,
  request_method VARCHAR(10),
  request_url VARCHAR(500),
  
  -- Change tracking
  old_values JSON,
  new_values JSON,
  changes JSON, -- Diff of changes
  
  -- Context
  module VARCHAR(100),
  description TEXT,
  severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  
  -- Additional metadata
  session_id VARCHAR(255),
  request_id VARCHAR(255),
  metadata JSON,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (admin_user_id) REFERENCES tbl_admin_user(id),
  FOREIGN KEY (user_id) REFERENCES tbl_user(id),
  
  INDEX idx_action (action),
  INDEX idx_entity_type (entity_type),
  INDEX idx_entity_id (entity_id),
  INDEX idx_admin_user_id (admin_user_id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_ip_address (ip_address),
  INDEX idx_module (module),
  INDEX idx_severity (severity)
);
```

## 5. API Endpoints

### 5.1 Admin User Management Controller

```typescript
@Controller('admin/users')
@ApiTags('admin-user-management')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminUserController {
  
  @Get()
  @RequirePermissions('admin.read')
  @ApiOperation({ summary: 'Get all admin users' })
  async getAdminUsers(@Query() queryDto: AdminUserQueryDto): Promise<PaginatedAdminUserDto>

  @Post()
  @RequirePermissions('admin.create')
  @AuditLog('CREATE_ADMIN_USER')
  @ApiOperation({ summary: 'Create new admin user' })
  async createAdminUser(@Body() createDto: CreateAdminUserDto, @Request() req): Promise<AdminUserDto>

  @Get(':id')
  @RequirePermissions('admin.read')
  @ApiOperation({ summary: 'Get admin user details' })
  async getAdminUser(@Param('id') id: string): Promise<AdminUserDetailDto>

  @Put(':id')
  @RequirePermissions('admin.update')
  @AuditLog('UPDATE_ADMIN_USER')
  @ApiOperation({ summary: 'Update admin user' })
  async updateAdminUser(@Param('id') id: string, @Body() updateDto: UpdateAdminUserDto): Promise<AdminUserDto>

  @Delete(':id')
  @RequirePermissions('admin.delete')
  @AuditLog('DELETE_ADMIN_USER')
  @ApiOperation({ summary: 'Delete admin user' })
  async deleteAdminUser(@Param('id') id: string): Promise<void>

  @Put(':id/status')
  @RequirePermissions('admin.manage')
  @AuditLog('UPDATE_ADMIN_STATUS')
  @ApiOperation({ summary: 'Update admin user status' })
  async updateAdminUserStatus(@Param('id') id: string, @Body() statusDto: UpdateAdminStatusDto): Promise<AdminUserDto>

  @Post(':id/reset-password')
  @RequirePermissions('admin.manage')
  @AuditLog('RESET_ADMIN_PASSWORD')
  @ApiOperation({ summary: 'Reset admin user password' })
  async resetAdminPassword(@Param('id') id: string): Promise<PasswordResetResultDto>

  @Put(':id/roles')
  @RequirePermissions('admin.manage')
  @AuditLog('UPDATE_ADMIN_ROLES')
  @ApiOperation({ summary: 'Update admin user roles' })
  async updateAdminRoles(@Param('id') id: string, @Body() rolesDto: UpdateAdminRolesDto): Promise<AdminUserDto>
}
```

### 5.2 Role & Permission Controller

```typescript
@Controller('admin/roles')
@ApiTags('admin-roles')
@UseGuards(JwtAuthGuard, AdminGuard)
export class RolePermissionController {
  
  @Get('roles')
  @RequirePermissions('role.read')
  @ApiOperation({ summary: 'Get all roles' })
  async getRoles(@Query() queryDto: RoleQueryDto): Promise<RoleDto[]>

  @Post('roles')
  @RequirePermissions('role.create')
  @AuditLog('CREATE_ROLE')
  @ApiOperation({ summary: 'Create new role' })
  async createRole(@Body() createDto: CreateRoleDto): Promise<RoleDto>

  @Put('roles/:id')
  @RequirePermissions('role.update')
  @AuditLog('UPDATE_ROLE')
  @ApiOperation({ summary: 'Update role' })
  async updateRole(@Param('id') id: string, @Body() updateDto: UpdateRoleDto): Promise<RoleDto>

  @Delete('roles/:id')
  @RequirePermissions('role.delete')
  @AuditLog('DELETE_ROLE')
  @ApiOperation({ summary: 'Delete role' })
  async deleteRole(@Param('id') id: string): Promise<void>

  @Get('permissions')
  @RequirePermissions('permission.read')
  @ApiOperation({ summary: 'Get all permissions' })
  async getPermissions(@Query() queryDto: PermissionQueryDto): Promise<PermissionDto[]>

  @Post('permissions')
  @RequirePermissions('permission.create')
  @AuditLog('CREATE_PERMISSION')
  @ApiOperation({ summary: 'Create new permission' })
  async createPermission(@Body() createDto: CreatePermissionDto): Promise<PermissionDto>

  @Put('roles/:roleId/permissions')
  @RequirePermissions('role.manage')
  @AuditLog('UPDATE_ROLE_PERMISSIONS')
  @ApiOperation({ summary: 'Update role permissions' })
  async updateRolePermissions(@Param('roleId') roleId: string, @Body() permissionsDto: UpdateRolePermissionsDto): Promise<RoleDto>

  @Get('roles/:roleId/permissions')
  @RequirePermissions('role.read')
  @ApiOperation({ summary: 'Get role permissions' })
  async getRolePermissions(@Param('roleId') roleId: string): Promise<PermissionDto[]>
}
```

### 5.3 System Configuration Controller

```typescript
@Controller('admin/system')
@ApiTags('admin-system')
@UseGuards(JwtAuthGuard, AdminGuard)
export class SystemConfigController {
  
  @Get('config')
  @RequirePermissions('system.read')
  @ApiOperation({ summary: 'Get system configurations' })
  async getSystemConfigs(@Query() queryDto: ConfigQueryDto): Promise<SystemConfigDto[]>

  @Get('config/:key')
  @RequirePermissions('system.read')
  @ApiOperation({ summary: 'Get specific configuration' })
  async getSystemConfig(@Param('key') key: string): Promise<SystemConfigDto>

  @Put('config/:key')
  @RequirePermissions('system.update')
  @AuditLog('UPDATE_SYSTEM_CONFIG')
  @ApiOperation({ summary: 'Update system configuration' })
  async updateSystemConfig(@Param('key') key: string, @Body() updateDto: UpdateConfigDto): Promise<SystemConfigDto>

  @Post('config/bulk-update')
  @RequirePermissions('system.update')
  @AuditLog('BULK_UPDATE_SYSTEM_CONFIG')
  @ApiOperation({ summary: 'Bulk update system configurations' })
  async bulkUpdateConfigs(@Body() bulkDto: BulkUpdateConfigDto): Promise<BulkUpdateResultDto>

  @Get('status')
  @RequirePermissions('system.read')
  @ApiOperation({ summary: 'Get system status' })
  async getSystemStatus(): Promise<SystemStatusDto>

  @Post('backup')
  @RequirePermissions('system.backup')
  @AuditLog('CREATE_BACKUP')
  @ApiOperation({ summary: 'Create system backup' })
  async createBackup(@Body() backupDto: CreateBackupDto): Promise<BackupResultDto>

  @Get('backups')
  @RequirePermissions('system.backup')
  @ApiOperation({ summary: 'Get backup history' })
  async getBackups(@Query() queryDto: BackupQueryDto): Promise<BackupDto[]>

  @Post('maintenance-mode')
  @RequirePermissions('system.manage')
  @AuditLog('TOGGLE_MAINTENANCE_MODE')
  @ApiOperation({ summary: 'Toggle maintenance mode' })
  async toggleMaintenanceMode(@Body() maintenanceDto: MaintenanceModeDto): Promise<MaintenanceResultDto>
}
```

### 5.4 Static Page Controller

```typescript
@Controller('admin/pages')
@ApiTags('admin-pages')
@UseGuards(JwtAuthGuard, AdminGuard)
export class StaticPageController {
  
  @Get()
  @RequirePermissions('page.read')
  @ApiOperation({ summary: 'Get all static pages' })
  async getStaticPages(@Query() queryDto: PageQueryDto): Promise<PaginatedPageDto>

  @Post()
  @RequirePermissions('page.create')
  @AuditLog('CREATE_STATIC_PAGE')
  @ApiOperation({ summary: 'Create static page' })
  async createStaticPage(@Body() createDto: CreateStaticPageDto, @Request() req): Promise<StaticPageDto>

  @Get(':id')
  @RequirePermissions('page.read')
  @ApiOperation({ summary: 'Get static page details' })
  async getStaticPage(@Param('id') id: string): Promise<StaticPageDetailDto>

  @Put(':id')
  @RequirePermissions('page.update')
  @AuditLog('UPDATE_STATIC_PAGE')
  @ApiOperation({ summary: 'Update static page' })
  async updateStaticPage(@Param('id') id: string, @Body() updateDto: UpdateStaticPageDto): Promise<StaticPageDto>

  @Delete(':id')
  @RequirePermissions('page.delete')
  @AuditLog('DELETE_STATIC_PAGE')
  @ApiOperation({ summary: 'Delete static page' })
  async deleteStaticPage(@Param('id') id: string): Promise<void>

  @Put(':id/publish')
  @RequirePermissions('page.publish')
  @AuditLog('PUBLISH_STATIC_PAGE')
  @ApiOperation({ summary: 'Publish/unpublish static page' })
  async togglePagePublication(@Param('id') id: string, @Body() publishDto: PublishPageDto): Promise<StaticPageDto>
}
```

### 5.5 Audit Log Controller

```typescript
@Controller('admin/audit')
@ApiTags('admin-audit')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AuditLogController {
  
  @Get('logs')
  @RequirePermissions('audit.read')
  @ApiOperation({ summary: 'Get audit logs' })
  async getAuditLogs(@Query() queryDto: AuditLogQueryDto): Promise<PaginatedAuditLogDto>

  @Get('logs/:id')
  @RequirePermissions('audit.read')
  @ApiOperation({ summary: 'Get audit log details' })
  async getAuditLog(@Param('id') id: string): Promise<AuditLogDetailDto>

  @Get('activity/:userId')
  @RequirePermissions('audit.read')
  @ApiOperation({ summary: 'Get user activity logs' })
  async getUserActivity(@Param('userId') userId: string, @Query() queryDto: ActivityQueryDto): Promise<UserActivityDto>

  @Get('export')
  @RequirePermissions('audit.export')
  @ApiOperation({ summary: 'Export audit logs' })
  async exportAuditLogs(@Query() exportDto: AuditExportDto, @Res() response: Response): Promise<void>

  @Get('statistics')
  @RequirePermissions('audit.read')
  @ApiOperation({ summary: 'Get audit statistics' })
  async getAuditStatistics(@Query() statsDto: AuditStatsQueryDto): Promise<AuditStatisticsDto>
}
```

## 6. Business Logic

### 6.1 Admin Service Core Methods

```typescript
@Injectable()
export class AdminService {
  
  // Admin user management
  async createAdminUser(adminData: CreateAdminUserDto, createdBy: string): Promise<AdminUser>
  async updateAdminUser(adminId: string, updateData: UpdateAdminUserDto): Promise<AdminUser>
  async deleteAdminUser(adminId: string): Promise<void>
  async getAdminUser(adminId: string): Promise<AdminUser>
  async getAdminUsers(queryDto: AdminUserQueryDto): Promise<PaginatedResult<AdminUser>>

  // Authentication and authorization
  async authenticateAdmin(email: string, password: string): Promise<AdminAuthResult>
  async checkAdminPermission(adminId: string, permission: string): Promise<boolean>
  async getAdminPermissions(adminId: string): Promise<string[]>
  async updateAdminStatus(adminId: string, status: AdminStatus): Promise<AdminUser>

  // Role management
  async assignRolesToAdmin(adminId: string, roleIds: string[]): Promise<AdminUser>
  async removeRoleFromAdmin(adminId: string, roleId: string): Promise<AdminUser>
  async getAdminRoles(adminId: string): Promise<Role[]>

  // Security features
  async lockAdminUser(adminId: string, reason: string): Promise<AdminUser>
  async unlockAdminUser(adminId: string): Promise<AdminUser>
  async resetAdminPassword(adminId: string): Promise<PasswordResetResult>
  async enableTwoFactor(adminId: string): Promise<TwoFactorSetupResult>

  // Activity tracking
  async logAdminActivity(adminId: string, activity: AdminActivity): Promise<void>
  async getAdminActivity(adminId: string, dateRange: DateRange): Promise<AdminActivity[]>
  async updateLastLogin(adminId: string, ipAddress: string): Promise<void>
}
```

### 6.2 Role Permission Service

```typescript
@Injectable()
export class RolePermissionService {
  
  // Role management
  async createRole(roleData: CreateRoleDto): Promise<Role>
  async updateRole(roleId: string, updateData: UpdateRoleDto): Promise<Role>
  async deleteRole(roleId: string): Promise<void>
  async getRoles(queryDto: RoleQueryDto): Promise<Role[]>
  async getRoleHierarchy(): Promise<RoleHierarchy>

  // Permission management
  async createPermission(permissionData: CreatePermissionDto): Promise<Permission>
  async updatePermission(permissionId: string, updateData: UpdatePermissionDto): Promise<Permission>
  async deletePermission(permissionId: string): Promise<void>
  async getPermissions(queryDto: PermissionQueryDto): Promise<Permission[]>
  async getPermissionsByModule(module: string): Promise<Permission[]>

  // Role-Permission assignment
  async assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<Role>
  async removePermissionFromRole(roleId: string, permissionId: string): Promise<Role>
  async getRolePermissions(roleId: string): Promise<Permission[]>
  async getEffectivePermissions(roleId: string): Promise<Permission[]>

  // Permission checking
  async checkPermission(userId: string, permission: string): Promise<boolean>
  async checkPermissionWithConditions(userId: string, permission: string, context: any): Promise<boolean>
  async getUserEffectivePermissions(userId: string): Promise<string[]>

  // Role inheritance
  async getChildRoles(roleId: string): Promise<Role[]>
  async getParentRoles(roleId: string): Promise<Role[]>
  async calculateEffectiveRolePermissions(roleId: string): Promise<Permission[]>

  // Bulk operations
  async bulkAssignPermissions(assignments: RolePermissionAssignment[]): Promise<BulkAssignmentResult>
  async bulkRemovePermissions(removals: RolePermissionRemoval[]): Promise<BulkRemovalResult>
}
```

### 6.3 System Configuration Service

```typescript
@Injectable()
export class SystemConfigService {
  
  // Configuration management
  async getConfig(key: string): Promise<any>
  async setConfig(key: string, value: any, adminId: string): Promise<SystemConfig>
  async getConfigsByCategory(category: string): Promise<SystemConfig[]>
  async getPublicConfigs(): Promise<SystemConfig[]>
  async bulkUpdateConfigs(updates: ConfigUpdate[], adminId: string): Promise<BulkUpdateResult>

  // Configuration validation
  async validateConfigValue(key: string, value: any): Promise<ValidationResult>
  async getConfigSchema(key: string): Promise<ConfigSchema>
  async resetConfigToDefault(key: string, adminId: string): Promise<SystemConfig>

  // System settings
  async getSystemInfo(): Promise<SystemInfo>
  async getSystemStatus(): Promise<SystemStatus>
  async updateSystemMaintenance(enabled: boolean, message: string, adminId: string): Promise<MaintenanceStatus>

  // Email configuration
  async testEmailConfiguration(): Promise<EmailTestResult>
  async updateEmailSettings(settings: EmailSettings, adminId: string): Promise<EmailConfig>

  // Payment configuration
  async updatePaymentSettings(provider: string, settings: PaymentSettings, adminId: string): Promise<PaymentConfig>
  async testPaymentConnection(provider: string): Promise<PaymentTestResult>

  // Configuration backup/restore
  async backupConfigurations(): Promise<ConfigBackup>
  async restoreConfigurations(backup: ConfigBackup, adminId: string): Promise<RestoreResult>

  // Environment-specific configs
  async getEnvironmentConfigs(): Promise<EnvironmentConfig>
  async migrateConfigsToNewVersion(version: string): Promise<MigrationResult>
}
```

### 6.4 Audit Log Service

```typescript
@Injectable()
export class AuditLogService {
  
  // Audit logging
  async logAction(auditData: CreateAuditLogDto): Promise<AuditLog>
  async logUserAction(userId: string, action: string, details: AuditDetails): Promise<AuditLog>
  async logSystemAction(action: string, details: AuditDetails): Promise<AuditLog>
  async logDataChange(entityType: string, entityId: string, oldData: any, newData: any, userId: string): Promise<AuditLog>

  // Audit retrieval
  async getAuditLogs(queryDto: AuditLogQueryDto): Promise<PaginatedResult<AuditLog>>
  async getAuditLog(logId: string): Promise<AuditLog>
  async getEntityAuditHistory(entityType: string, entityId: string): Promise<AuditLog[]>
  async getUserAuditHistory(userId: string, dateRange: DateRange): Promise<AuditLog[]>

  // Audit analytics
  async getAuditStatistics(statsQuery: AuditStatsQuery): Promise<AuditStatistics>
  async getSecurityEvents(dateRange: DateRange): Promise<SecurityEvent[]>
  async detectSuspiciousActivity(): Promise<SuspiciousActivity[]>
  async generateComplianceReport(reportType: ComplianceReportType, dateRange: DateRange): Promise<ComplianceReport>

  // Audit maintenance
  async archiveOldAuditLogs(cutoffDate: Date): Promise<ArchiveResult>
  async exportAuditLogs(filters: AuditExportFilters): Promise<Buffer>
  async anonymizeAuditLogs(userId: string): Promise<AnonymizationResult>

  // Real-time monitoring
  async getRealtimeActivity(): Promise<RealtimeActivity[]>
  async subscribeToAuditEvents(callback: (event: AuditEvent) => void): void
  async unsubscribeFromAuditEvents(): void
}
```

## 7. Data Transfer Objects (DTOs)

### 7.1 Admin User DTOs

```typescript
export class CreateAdminUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  fullName: string;

  @IsOptional()
  @IsPhoneNumber('VN')
  phoneNumber?: string;

  @IsArray()
  @IsString({ each: true })
  roleIds: string[];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean = false;

  @IsOptional()
  @IsEnum(AdminStatus)
  status?: AdminStatus = AdminStatus.ACTIVE;
}

export class AdminUserDto {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  status: AdminStatus;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: Date;
  lastLoginIp?: string;
  lastActivityAt?: Date;
  roles: RoleDto[];
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class AdminUserDetailDto extends AdminUserDto {
  failedLoginAttempts: number;
  lockedUntil?: Date;
  passwordChangedAt?: Date;
  passwordExpiresAt?: Date;
  createdBy: string;
  notes?: string;
  loginHistory: LoginHistoryDto[];
  recentActivity: ActivityDto[];
}
```

### 7.2 Role & Permission DTOs

```typescript
export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  displayName: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  parentRoleId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissionIds?: string[];
}

export class RoleDto {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  parentRoleId?: string;
  level: number;
  isActive: boolean;
  isSystemRole: boolean;
  permissions: PermissionDto[];
  childRoles?: RoleDto[];
  userCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class PermissionDto {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  module: string;
  action: string;
  resource?: string;
  parentPermissionId?: string;
  isActive: boolean;
  isSystemPermission: boolean;
  children?: PermissionDto[];
}

export class UpdateRolePermissionsDto {
  @IsArray()
  permissions: RolePermissionAssignmentDto[];
}

export class RolePermissionAssignmentDto {
  @IsString()
  permissionId: string;

  @IsBoolean()
  granted: boolean;

  @IsOptional()
  @IsObject()
  conditions?: any;
}
```

### 7.3 System Configuration DTOs

```typescript
export class SystemConfigDto {
  id: string;
  configKey: string;
  configValue: any;
  configType: ConfigType;
  module?: string;
  category?: string;
  displayName?: string;
  description?: string;
  isSensitive: boolean;
  isPublic: boolean;
  requiresRestart: boolean;
  validationRules?: any;
  defaultValue?: any;
  lastModifiedBy?: string;
  updatedAt: Date;
}

export class UpdateConfigDto {
  @IsNotEmpty()
  value: any;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class BulkUpdateConfigDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfigUpdateItem)
  updates: ConfigUpdateItem[];

  @IsOptional()
  @IsString()
  reason?: string;
}

export class ConfigUpdateItem {
  @IsString()
  key: string;

  @IsNotEmpty()
  value: any;
}

export class SystemStatusDto {
  status: 'healthy' | 'warning' | 'error';
  version: string;
  uptime: number;
  environment: string;
  maintenanceMode: boolean;
  services: ServiceStatusDto[];
  metrics: SystemMetricsDto;
  lastChecked: Date;
}
```

### 7.4 Audit Log DTOs

```typescript
export class AuditLogDto {
  id: string;
  action: string;
  entityType?: string;
  entityId?: string;
  adminUserId?: string;
  userId?: string;
  username?: string;
  userType: UserType;
  ipAddress?: string;
  userAgent?: string;
  requestMethod?: string;
  requestUrl?: string;
  oldValues?: any;
  newValues?: any;
  changes?: any;
  module?: string;
  description?: string;
  severity: AuditSeverity;
  sessionId?: string;
  requestId?: string;
  metadata?: any;
  createdAt: Date;
}

export class AuditLogQueryDto {
  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  module?: string;

  @IsOptional()
  @IsEnum(AuditSeverity)
  severity?: AuditSeverity;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

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
```

## 8. Business Rules

### 8.1 Admin Security Rules

```typescript
export class AdminSecurityRules {
  
  static readonly PASSWORD_MIN_LENGTH = 12;
  static readonly PASSWORD_REQUIRE_SPECIAL_CHARS = true;
  static readonly MAX_FAILED_LOGIN_ATTEMPTS = 5;
  static readonly ACCOUNT_LOCKOUT_DURATION = 30; // minutes
  static readonly PASSWORD_EXPIRY_DAYS = 90;
  static readonly SESSION_TIMEOUT_MINUTES = 60;
  
  static validatePassword(password: string): ValidationResult {
    if (password.length < this.PASSWORD_MIN_LENGTH) {
      throw new AdminValidationException(`Password must be at least ${this.PASSWORD_MIN_LENGTH} characters long`);
    }
    
    if (this.PASSWORD_REQUIRE_SPECIAL_CHARS) {
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) {
        throw new AdminValidationException('Password must contain uppercase, lowercase, number, and special character');
      }
    }
    
    return { valid: true };
  }
  
  static canDeleteAdminUser(adminUser: AdminUser, requesterUser: AdminUser): ValidationResult {
    // Cannot delete super admin
    if (adminUser.isSuperAdmin) {
      throw new AdminValidationException('Cannot delete super admin user');
    }
    
    // Cannot delete self
    if (adminUser.id === requesterUser.id) {
      throw new AdminValidationException('Cannot delete your own account');
    }
    
    // Must have higher privileges
    if (!requesterUser.isSuperAdmin && adminUser.roles.some(role => role.level >= requesterUser.roles[0]?.level)) {
      throw new AdminValidationException('Insufficient privileges to delete this user');
    }
    
    return { valid: true };
  }
  
  static shouldLockAccount(failedAttempts: number): boolean {
    return failedAttempts >= this.MAX_FAILED_LOGIN_ATTEMPTS;
  }
  
  static isPasswordExpired(passwordChangedAt: Date): boolean {
    const daysSinceChange = (Date.now() - passwordChangedAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceChange > this.PASSWORD_EXPIRY_DAYS;
  }
}
```

### 8.2 Permission Validation Rules

```typescript
export class PermissionRules {
  
  static readonly SYSTEM_PERMISSIONS = [
    'system.read', 'system.update', 'system.manage', 'system.backup'
  ];
  
  static readonly MODULE_PERMISSIONS = {
    product: ['create', 'read', 'update', 'delete', 'manage'],
    order: ['create', 'read', 'update', 'delete', 'manage'],
    customer: ['create', 'read', 'update', 'delete', 'manage'],
    admin: ['create', 'read', 'update', 'delete', 'manage'],
    role: ['create', 'read', 'update', 'delete', 'manage'],
    permission: ['create', 'read', 'update', 'delete', 'manage']
  };
  
  static canAssignPermission(requesterRoles: Role[], permissionToAssign: Permission): ValidationResult {
    // Super admin can assign any permission
    if (requesterRoles.some(role => role.name === 'super_admin')) {
      return { valid: true };
    }
    
    // Cannot assign system permissions unless has system.manage
    if (this.SYSTEM_PERMISSIONS.includes(permissionToAssign.name)) {
      const hasSystemManage = requesterRoles.some(role => 
        role.permissions.some(p => p.name === 'system.manage')
      );
      if (!hasSystemManage) {
        throw new PermissionValidationException('Cannot assign system permissions without system.manage permission');
      }
    }
    
    // Can only assign permissions that you have
    const hasPermission = requesterRoles.some(role =>
      role.permissions.some(p => p.name === permissionToAssign.name)
    );
    
    if (!hasPermission) {
      throw new PermissionValidationException('Cannot assign permission that you do not have');
    }
    
    return { valid: true };
  }
  
  static validateRoleHierarchy(parentRole: Role, childRole: Role): ValidationResult {
    // Prevent circular references
    if (parentRole.id === childRole.id) {
      throw new RoleValidationException('Role cannot be parent of itself');
    }
    
    // Check for circular dependency
    if (this.wouldCreateCircularDependency(parentRole, childRole)) {
      throw new RoleValidationException('Cannot create circular role dependency');
    }
    
    return { valid: true };
  }
  
  private static wouldCreateCircularDependency(parentRole: Role, childRole: Role): boolean {
    // Check if parentRole is already a descendant of childRole
    const descendants = this.getAllDescendants(childRole);
    return descendants.some(desc => desc.id === parentRole.id);
  }
}
```

## 9. Background Processing

### 9.1 Admin Maintenance Processor

```typescript
@Processor('admin-maintenance')
export class AdminMaintenanceProcessor {
  
  @Process('cleanup-expired-sessions')
  async cleanupExpiredSessions(): Promise<void> {
    const expiredSessions = await this.sessionService.getExpiredSessions();
    
    for (const session of expiredSessions) {
      await this.sessionService.deleteSession(session.id);
    }
    
    this.logger.log(`Cleaned up ${expiredSessions.length} expired sessions`);
  }
  
  @Process('check-password-expiry')
  async checkPasswordExpiry(): Promise<void> {
    const adminsWithExpiringPasswords = await this.adminService.getAdminsWithExpiringPasswords();
    
    for (const admin of adminsWithExpiringPasswords) {
      const daysUntilExpiry = this.calculateDaysUntilExpiry(admin.passwordChangedAt);
      
      if (daysUntilExpiry <= 7) {
        await this.emailService.sendPasswordExpiryWarning(admin.email, daysUntilExpiry);
      }
      
      if (daysUntilExpiry <= 0) {
        await this.adminService.forcePasswordReset(admin.id);
      }
    }
  }
  
  @Process('audit-log-maintenance')
  async auditLogMaintenance(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 12); // Keep 12 months
    
    const archivedCount = await this.auditLogService.archiveOldAuditLogs(cutoffDate);
    this.logger.log(`Archived ${archivedCount} audit logs older than 12 months`);
    
    // Anonymize logs for deleted users
    const deletedUsers = await this.adminService.getDeletedAdminUsers();
    for (const user of deletedUsers) {
      await this.auditLogService.anonymizeAuditLogs(user.id);
    }
  }
  
  @Cron('0 2 * * *') // Daily at 2 AM
  async dailyMaintenance(): Promise<void> {
    await this.adminMaintenanceQueue.add('cleanup-expired-sessions');
    await this.adminMaintenanceQueue.add('check-password-expiry');
    await this.adminMaintenanceQueue.add('audit-log-maintenance');
  }
  
  @Cron('0 0 * * 0') // Weekly on Sunday
  async weeklyMaintenance(): Promise<void> {
    // Generate security report
    await this.generateSecurityReport();
    
    // Check for inactive admin accounts
    await this.checkInactiveAdminAccounts();
    
    // Validate role and permission consistency
    await this.validateRolePermissionConsistency();
  }
}
```

## 10. Event System

### 10.1 Admin Events

```typescript
export class AdminEventService {
  
  @OnEvent('admin.created')
  async handleAdminCreated(event: AdminCreatedEvent): Promise<void> {
    const { admin, createdBy } = event;
    
    // Send welcome email with initial password
    await this.emailService.sendAdminWelcomeEmail(admin.email, admin.temporaryPassword);
    
    // Log creation
    await this.auditLogService.logAction({
      action: 'CREATE_ADMIN',
      entityType: 'AdminUser',
      entityId: admin.id,
      adminUserId: createdBy,
      description: `New admin user created: ${admin.username}`,
      severity: AuditSeverity.MEDIUM
    });
    
    // Notify other super admins
    await this.notificationService.notifySuperAdmins('new_admin_created', {
      adminId: admin.id,
      username: admin.username,
      createdBy
    });
  }
  
  @OnEvent('admin.login.success')
  async handleAdminLoginSuccess(event: AdminLoginSuccessEvent): Promise<void> {
    const { admin, ipAddress, userAgent } = event;
    
    // Update last login
    await this.adminService.updateLastLogin(admin.id, ipAddress);
    
    // Reset failed login attempts
    await this.adminService.resetFailedLoginAttempts(admin.id);
    
    // Log successful login
    await this.auditLogService.logAction({
      action: 'LOGIN_SUCCESS',
      adminUserId: admin.id,
      ipAddress,
      userAgent,
      description: 'Admin user logged in successfully',
      severity: AuditSeverity.LOW
    });
  }
  
  @OnEvent('admin.login.failed')
  async handleAdminLoginFailed(event: AdminLoginFailedEvent): Promise<void> {
    const { email, ipAddress, userAgent, reason } = event;
    
    // Increment failed login attempts
    const admin = await this.adminService.getAdminByEmail(email);
    if (admin) {
      await this.adminService.incrementFailedLoginAttempts(admin.id);
      
      // Lock account if too many attempts
      if (AdminSecurityRules.shouldLockAccount(admin.failedLoginAttempts + 1)) {
        await this.adminService.lockAdminUser(admin.id, 'Too many failed login attempts');
        
        // Send security alert
        await this.emailService.sendAccountLockAlert(admin.email, ipAddress);
      }
    }
    
    // Log failed login
    await this.auditLogService.logAction({
      action: 'LOGIN_FAILED',
      adminUserId: admin?.id,
      ipAddress,
      userAgent,
      description: `Admin login failed: ${reason}`,
      severity: AuditSeverity.HIGH,
      metadata: { email, reason }
    });
  }
  
  @OnEvent('admin.permission.changed')
  async handleAdminPermissionChanged(event: AdminPermissionChangedEvent): Promise<void> {
    const { adminId, changedBy, oldPermissions, newPermissions } = event;
    
    // Log permission change
    await this.auditLogService.logDataChange(
      'AdminUser',
      adminId,
      { permissions: oldPermissions },
      { permissions: newPermissions },
      changedBy
    );
    
    // Invalidate admin sessions if critical permissions changed
    const criticalPermissions = ['system.manage', 'admin.delete', 'role.manage'];
    const hasCriticalChanges = this.hasCriticalPermissionChanges(oldPermissions, newPermissions, criticalPermissions);
    
    if (hasCriticalChanges) {
      await this.sessionService.invalidateAdminSessions(adminId);
      await this.emailService.sendPermissionChangeNotification(adminId);
    }
  }
}
```

## 11. Security & Authorization

### 11.1 Admin Security Service

```typescript
@Injectable()
export class AdminSecurityService {
  
  async validateAdminAccess(adminId: string, permission: string, context?: any): Promise<boolean> {
    const admin = await this.adminService.getAdminUser(adminId);
    
    // Check if admin is active
    if (admin.status !== AdminStatus.ACTIVE) {
      throw new UnauthorizedException('Admin account is not active');
    }
    
    // Check if account is locked
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      throw new UnauthorizedException('Admin account is locked');
    }
    
    // Check password expiry
    if (AdminSecurityRules.isPasswordExpired(admin.passwordChangedAt)) {
      throw new UnauthorizedException('Password has expired');
    }
    
    // Check permission
    const hasPermission = await this.rolePermissionService.checkPermission(adminId, permission);
    if (!hasPermission) {
      throw new ForbiddenException(`Insufficient permissions: ${permission}`);
    }
    
    // Context-specific validation
    if (context && !await this.validatePermissionContext(adminId, permission, context)) {
      throw new ForbiddenException('Permission denied for this context');
    }
    
    return true;
  }
  
  async detectSuspiciousActivity(adminId: string): Promise<SuspiciousActivityReport> {
    const activities = await this.auditLogService.getUserAuditHistory(adminId, this.getLastWeek());
    const indicators: SuspiciousIndicator[] = [];
    
    // Check for unusual login times
    const loginTimes = activities
      .filter(a => a.action === 'LOGIN_SUCCESS')
      .map(a => a.createdAt.getHours());
    
    const hasUnusualHours = loginTimes.some(hour => hour < 6 || hour > 22);
    if (hasUnusualHours) {
      indicators.push({
        type: 'unusual_login_time',
        severity: 'medium',
        description: 'Login outside normal business hours'
      });
    }
    
    // Check for multiple IP addresses
    const ipAddresses = new Set(activities.map(a => a.ipAddress).filter(Boolean));
    if (ipAddresses.size > 5) {
      indicators.push({
        type: 'multiple_ip_addresses',
        severity: 'high',
        description: `Activity from ${ipAddresses.size} different IP addresses`
      });
    }
    
    // Check for bulk operations
    const bulkOperations = activities.filter(a => 
      a.action.includes('BULK_') || 
      (a.metadata && a.metadata.batchSize > 10)
    );
    
    if (bulkOperations.length > 3) {
      indicators.push({
        type: 'excessive_bulk_operations',
        severity: 'medium',
        description: 'Multiple bulk operations performed'
      });
    }
    
    return {
      adminId,
      indicators,
      riskScore: this.calculateRiskScore(indicators),
      lastChecked: new Date()
    };
  }
  
  async enforceSecurityPolicies(adminId: string): Promise<SecurityPolicyResult> {
    const admin = await this.adminService.getAdminUser(adminId);
    const policies: PolicyCheck[] = [];
    
    // Password policy
    if (AdminSecurityRules.isPasswordExpired(admin.passwordChangedAt)) {
      policies.push({
        policy: 'password_expiry',
        status: 'violation',
        action: 'force_password_reset',
        message: 'Password has expired and must be changed'
      });
    }
    
    // Session policy
    const activeSessions = await this.sessionService.getAdminSessions(adminId);
    if (activeSessions.length > 3) {
      policies.push({
        policy: 'max_concurrent_sessions',
        status: 'violation',
        action: 'terminate_oldest_sessions',
        message: 'Too many concurrent sessions'
      });
    }
    
    // Two-factor authentication policy
    if (!admin.twoFactorEnabled && this.configService.get('REQUIRE_2FA_FOR_ADMINS')) {
      policies.push({
        policy: 'two_factor_required',
        status: 'violation',
        action: 'force_2fa_setup',
        message: 'Two-factor authentication is required'
      });
    }
    
    return {
      adminId,
      policies,
      hasViolations: policies.some(p => p.status === 'violation'),
      lastChecked: new Date()
    };
  }
}
```

## 12. Performance Optimization

### 12.1 Admin Cache Service

```typescript
@Injectable()
export class AdminCacheService {
  
  private readonly ADMIN_CACHE_TTL = 900; // 15 minutes
  private readonly PERMISSION_CACHE_TTL = 3600; // 1 hour
  
  async getCachedAdmin(adminId: string): Promise<AdminUser | null> {
    const cacheKey = `admin:${adminId}`;
    return await this.cacheManager.get(cacheKey);
  }
  
  async cacheAdmin(admin: AdminUser): Promise<void> {
    const cacheKey = `admin:${admin.id}`;
    await this.cacheManager.set(cacheKey, admin, this.ADMIN_CACHE_TTL);
  }
  
  async getCachedAdminPermissions(adminId: string): Promise<string[] | null> {
    const cacheKey = `admin:permissions:${adminId}`;
    return await this.cacheManager.get(cacheKey);
  }
  
  async cacheAdminPermissions(adminId: string, permissions: string[]): Promise<void> {
    const cacheKey = `admin:permissions:${adminId}`;
    await this.cacheManager.set(cacheKey, permissions, this.PERMISSION_CACHE_TTL);
  }
  
  async invalidateAdminCache(adminId: string): Promise<void> {
    const patterns = [
      `admin:${adminId}`,
      `admin:permissions:${adminId}`,
      `admin:roles:${adminId}`,
      `admin:sessions:${adminId}`
    ];
    
    for (const pattern of patterns) {
      await this.cacheManager.del(pattern);
    }
  }
  
  async invalidateRoleCache(roleId: string): Promise<void> {
    // Invalidate all admin caches since role changes affect permissions
    const pattern = 'admin:permissions:*';
    await this.cacheManager.del(pattern);
  }
}
```

## 13. Error Handling

### 13.1 Custom Exceptions

```typescript
export class AdminValidationException extends BaseException {
  constructor(message: string) {
    super(message, 400);
  }
}

export class AdminNotFoundException extends BaseException {
  constructor(adminId: string) {
    super(`Admin user with ID ${adminId} not found`, 404);
  }
}

export class PermissionValidationException extends BaseException {
  constructor(message: string) {
    super(message, 403);
  }
}

export class RoleValidationException extends BaseException {
  constructor(message: string) {
    super(message, 400);
  }
}

export class SystemConfigException extends BaseException {
  constructor(message: string) {
    super(message, 422);
  }
}
```

## 14. Monitoring & Analytics

### 14.1 Admin Metrics Service

```typescript
@Injectable()
export class AdminMetricsService {
  
  async getAdminSystemMetrics(): Promise<AdminSystemMetrics> {
    return {
      totalAdmins: await this.getTotalAdmins(),
      activeAdmins: await this.getActiveAdmins(),
      lockedAdmins: await this.getLockedAdmins(),
      adminLoginRate: await this.getAdminLoginRate(),
      permissionViolations: await this.getPermissionViolations(),
      securityAlerts: await this.getSecurityAlerts(),
      systemHealth: await this.getSystemHealth(),
      auditLogVolume: await this.getAuditLogVolume()
    };
  }
  
  async generateSecurityReport(dateRange: DateRange): Promise<SecurityReport> {
    return {
      period: dateRange,
      loginAttempts: await this.getLoginAttemptStats(dateRange),
      securityEvents: await this.getSecurityEvents(dateRange),
      permissionChanges: await this.getPermissionChanges(dateRange),
      suspiciousActivities: await this.getSuspiciousActivities(dateRange),
      policyViolations: await this.getPolicyViolations(dateRange),
      recommendations: await this.generateSecurityRecommendations()
    };
  }
}
```

## 15. Testing Strategy

### 15.1 Unit Tests

- Admin service business logic
- Permission checking algorithms
- Role hierarchy validation
- Security policy enforcement
- Configuration validation

### 15.2 Integration Tests

- Admin API endpoints
- Database operations
- Authentication flows
- Event handling
- Background processing

### 15.3 E2E Tests

- Complete admin workflows
- Permission management
- System configuration
- Audit logging
- Security features

## 16. Future Enhancements

- Advanced threat detection using ML
- Single Sign-On (SSO) integration
- Mobile admin app support
- Advanced audit analytics dashboard
- Automated security policy enforcement
- Integration with external identity providers
- Advanced workflow approval systems
- Real-time security monitoring dashboard
