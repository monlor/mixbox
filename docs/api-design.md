# MixBox 用户端 API 设计文档

## 1. API 概述

### 1.1 设计原则
- **RESTful 设计**: 遵循 REST API 设计规范
- **类型安全**: 使用 TypeScript 确保类型安全
- **错误处理**: 统一的错误响应格式
- **响应式**: 支持实时数据更新
- **可扩展**: 便于后期集成真实后端

### 1.2 API 分类
- **官方服务 API**: 模拟与 MixBox 官方服务的交互
- **本地服务 API**: 处理本地功能和配置
- **实时数据 API**: WebSocket 和 Server-Sent Events

### 1.3 认证方式
- **JWT Token**: 用户认证使用 JWT Token
- **Bearer Authentication**: HTTP Header 中携带 Token
- **Session 管理**: 本地 Session 状态管理

## 2. 数据模型定义

### 2.1 基础类型定义

```typescript
// 通用响应类型
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: string;
}

// 错误类型
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// 分页类型
interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### 2.2 用户相关类型

```typescript
// 用户信息
interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  createdAt: string;
  lastLoginAt: string;
  preferences: UserPreferences;
  subscription: UserSubscription;
}

// 用户偏好设置
interface UserPreferences {
  language: 'zh-CN' | 'en' | 'zh-TW';
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  notifications: {
    email: boolean;
    desktop: boolean;
    mobile: boolean;
  };
}

// 用户订阅信息
interface UserSubscription {
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'suspended' | 'canceled';
  expiresAt?: string;
  features: string[];
}

// 登录凭据
interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

// 注册数据
interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}
```

### 2.3 服务相关类型

```typescript
// 服务状态
type ServiceStatus = 
  | 'installing' 
  | 'running' 
  | 'stopped' 
  | 'error' 
  | 'updating' 
  | 'uninstalling';

// 服务信息
interface Service {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  category: string;
  status: ServiceStatus;
  domain: string;
  subdomain: string;
  version: string;
  installedAt: string;
  lastUpdated: string;
  autoStart: boolean;
  ssoEnabled: boolean;
  sslEnabled: boolean;
  resources: ResourceUsage;
  configuration: ServiceConfig;
  logs: ServiceLog[];
}

// 资源使用情况
interface ResourceUsage {
  cpu: {
    usage: number;
    limit?: number;
  };
  memory: {
    usage: number;
    limit?: number;
  };
  storage: {
    usage: number;
    limit?: number;
  };
  network: {
    rx: number;
    tx: number;
  };
}

// 服务配置
interface ServiceConfig {
  environment: Record<string, string>;
  ports: PortMapping[];
  volumes: VolumeMapping[];
  networks: string[];
  restart: 'no' | 'always' | 'unless-stopped' | 'on-failure';
}

// 端口映射
interface PortMapping {
  host: number;
  container: number;
  protocol: 'tcp' | 'udp';
}

// 数据卷映射
interface VolumeMapping {
  host: string;
  container: string;
  mode: 'rw' | 'ro';
}

// 服务日志
interface ServiceLog {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  source: string;
}
```

### 2.4 应用市场类型

```typescript
// 应用分类
interface ApplicationCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  applicationCount: number;
}

// 应用信息
interface Application {
  id: string;
  name: string;
  displayName: string;
  description: string;
  longDescription: string;
  icon: string;
  screenshots: string[];
  category: string;
  tags: string[];
  version: string;
  author: ApplicationAuthor;
  homepage: string;
  documentation: string;
  repository: string;
  license: string;
  
  // 评分和统计
  rating: ApplicationRating;
  stats: ApplicationStats;
  
  // 技术配置
  docker: DockerConfiguration;
  domains: DomainConfiguration;
  sso: SSOConfiguration;
  
  // 安装要求
  requirements: ApplicationRequirements;
  
  // 应用元数据
  metadata: ApplicationMetadata;
  
  // 安装状态
  installStatus?: InstallationStatus;
}

// 应用作者
interface ApplicationAuthor {
  name: string;
  email?: string;
  website?: string;
  avatar?: string;
}

// 应用评分
interface ApplicationRating {
  average: number;
  total: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// 应用统计
interface ApplicationStats {
  downloads: number;
  installations: number;
  activeUsers: number;
  lastUpdated: string;
}

// Docker 配置
interface DockerConfiguration {
  image: string;
  tag: string;
  environment: EnvironmentVariable[];
  ports: DockerPort[];
  volumes: DockerVolume[];
  networks: string[];
  command?: string[];
  entrypoint?: string[];
  healthcheck?: HealthcheckConfig;
}

// 环境变量
interface EnvironmentVariable {
  name: string;
  value?: string;
  description: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'password' | 'file' | 'directory';
  options?: string[];
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
  };
}

// Docker 端口
interface DockerPort {
  container: number;
  protocol: 'tcp' | 'udp';
  description: string;
  required: boolean;
}

// Docker 数据卷
interface DockerVolume {
  container: string;
  description: string;
  required: boolean;
  type: 'bind' | 'volume';
}

// 健康检查配置
interface HealthcheckConfig {
  test: string[];
  interval: string;
  timeout: string;
  retries: number;
  startPeriod?: string;
}

// 安装要求
interface ApplicationRequirements {
  minMemory?: number;
  minStorage?: number;
  minCpuCores?: number;
  requiredFeatures?: string[];
  incompatibleWith?: string[];
}

// 应用元数据
interface ApplicationMetadata {
  featured: boolean;
  official: boolean;
  verified: boolean;
  experimental: boolean;
  deprecated: boolean;
  supportedArchitectures: string[];
  supportedPlatforms: string[];
}

// 安装状态
type InstallationStatus = 'not_installed' | 'installing' | 'installed' | 'failed' | 'updating';
```

### 2.5 域名管理类型

```typescript
// 域名配置
interface DomainConfiguration {
  // 官方分配域名
  official: {
    domain: string;           // username.mixbox.io
    status: 'active' | 'pending' | 'failed';
    dnsStatus: DNSStatus;
    sslStatus: SSLStatus;
    assignedAt: string;
  };
  
  // 自定义域名
  custom: CustomDomain[];
  
  // 子域名分配
  subdomains: SubdomainMapping[];
  
  // 当前使用的主域名
  primary: string;
  
  // DDNS 配置
  ddns: DDNSConfig;
}

// DNS 状态
interface DNSStatus {
  status: 'active' | 'pending' | 'failed';
  records: DNSRecord[];
  lastChecked: string;
  issues?: string[];
}

// DNS 记录
interface DNSRecord {
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT';
  name: string;
  value: string;
  ttl: number;
  verified: boolean;
}

// SSL 状态
interface SSLStatus {
  status: 'valid' | 'expired' | 'invalid' | 'pending';
  issuer?: string;
  expiresAt?: string;
  lastChecked: string;
  autoRenew: boolean;
}

// 自定义域名
interface CustomDomain {
  id: string;
  domain: string;
  status: 'pending' | 'active' | 'failed';
  dnsRecords: DNSRecord[];
  sslCertificate?: SSLCertificate;
  addedAt: string;
  verifiedAt?: string;
  lastChecked: string;
}

// SSL 证书
interface SSLCertificate {
  id: string;
  domain: string;
  issuer: string;
  issuedAt: string;
  expiresAt: string;
  autoRenew: boolean;
  status: 'valid' | 'expired' | 'revoked';
}

// 子域名映射
interface SubdomainMapping {
  id: string;
  subdomain: string;
  serviceId: string;
  serviceName: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

// DDNS 配置
interface DDNSConfig {
  enabled: boolean;
  provider: 'mixbox-official' | 'cloudflare' | 'dnspod' | 'custom';
  interval: number; // 分钟
  currentIP: string;
  lastUpdate: string;
  status: 'active' | 'failed' | 'disabled';
  logs: DDNSLog[];
}

// DDNS 日志
interface DDNSLog {
  id: string;
  timestamp: string;
  type: 'update' | 'check' | 'error';
  oldIP?: string;
  newIP?: string;
  message: string;
  success: boolean;
}
```

### 2.6 系统配置类型

```typescript
// 系统配置
interface SystemConfiguration {
  // 初始化状态
  setup: SetupStatus;
  
  // 官方服务连接
  official: OfficialConnection;
  
  // 系统设置
  system: SystemSettings;
  
  // 安全设置
  security: SecuritySettings;
}

// 设置状态
interface SetupStatus {
  isCompleted: boolean;
  currentStep: string;
  completedSteps: string[];
  completedAt?: string;
  version: string;
}

// 官方服务连接
interface OfficialConnection {
  apiUrl: string;
  connected: boolean;
  lastSync: string;
  userToken?: string;
  syncInterval: number; // 分钟
  status: 'connected' | 'disconnected' | 'error';
  error?: string;
}

// 系统设置
interface SystemSettings {
  autoStart: boolean;
  autoUpdate: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  maxLogSize: number; // MB
  backupEnabled: boolean;
  backupInterval: number; // 小时
  maintenanceMode: boolean;
}

// 安全设置
interface SecuritySettings {
  passwordPolicy: PasswordPolicy;
  sessionTimeout: number; // 分钟
  apiRateLimit: RateLimitConfig;
  auditLogEnabled: boolean;
  twoFactorAuth: TwoFactorConfig;
}

// 密码策略
interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  maxAge: number; // 天
}

// 速率限制配置
interface RateLimitConfig {
  enabled: boolean;
  requestsPerMinute: number;
  burstLimit: number;
  blacklistDuration: number; // 分钟
}

// 两步验证配置
interface TwoFactorConfig {
  enabled: boolean;
  method: 'totp' | 'sms' | 'email';
  backupCodes: string[];
  lastUsed?: string;
}
```

## 3. API 端点设计

### 3.1 官方服务 API (Mock)

#### 3.1.1 认证服务

```typescript
// POST /api/official/auth/register
interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  user: User;
  token: string;
  domain: string; // username.mixbox.io
}

// POST /api/official/auth/login
interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
  expiresAt: string;
}

// POST /api/official/auth/refresh
interface RefreshTokenRequest {
  refreshToken: string;
}

interface RefreshTokenResponse {
  token: string;
  expiresAt: string;
}

// POST /api/official/auth/logout
interface LogoutRequest {
  token: string;
}
```

#### 3.1.2 域名服务

```typescript
// GET /api/official/domain/info
interface DomainInfoResponse {
  domain: string;
  status: 'active' | 'pending' | 'suspended';
  dnsStatus: DNSStatus;
  sslStatus: SSLStatus;
  usage: {
    subdomains: number;
    maxSubdomains: number;
  };
}

// POST /api/official/domain/custom
interface AddCustomDomainRequest {
  domain: string;
}

interface AddCustomDomainResponse {
  id: string;
  domain: string;
  verificationRecords: DNSRecord[];
  status: 'pending';
}

// PUT /api/official/domain/custom/:id/verify
interface VerifyCustomDomainResponse {
  verified: boolean;
  issues?: string[];
}

// DELETE /api/official/domain/custom/:id
```

#### 3.1.3 DDNS 服务

```typescript
// POST /api/official/ddns/update
interface DDNSUpdateRequest {
  domain: string;
  ip: string;
  recordType: 'A' | 'AAAA';
}

interface DDNSUpdateResponse {
  success: boolean;
  previousIP?: string;
  newIP: string;
  updatedAt: string;
}

// GET /api/official/ddns/status
interface DDNSStatusResponse {
  domain: string;
  currentIP: string;
  lastUpdate: string;
  status: 'active' | 'failed';
  nextCheck: string;
}

// GET /api/official/ddns/logs
interface DDNSLogsResponse {
  logs: DDNSLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
```

### 3.2 本地服务 API

#### 3.2.1 系统初始化

```typescript
// GET /api/setup/status
interface SetupStatusResponse {
  isCompleted: boolean;
  currentStep: string;
  completedSteps: string[];
  availableSteps: string[];
}

// POST /api/setup/complete
interface CompleteSetupRequest {
  userInfo: {
    username: string;
    email: string;
    password: string;
  };
  preferences: UserPreferences;
  ddnsEnabled: boolean;
}

interface CompleteSetupResponse {
  success: boolean;
  user: User;
  domain: string;
  token: string;
}
```

#### 3.2.2 服务管理

```typescript
// GET /api/services
interface GetServicesResponse {
  services: Service[];
  stats: {
    total: number;
    running: number;
    stopped: number;
    error: number;
  };
}

// GET /api/services/:id
interface GetServiceResponse {
  service: Service;
  logs: ServiceLog[];
  metrics: ResourceUsage;
}

// POST /api/services/:id/start
interface StartServiceResponse {
  success: boolean;
  status: ServiceStatus;
  startedAt: string;
}

// POST /api/services/:id/stop
interface StopServiceResponse {
  success: boolean;
  status: ServiceStatus;
  stoppedAt: string;
}

// POST /api/services/:id/restart
interface RestartServiceResponse {
  success: boolean;
  status: ServiceStatus;
  restartedAt: string;
}

// DELETE /api/services/:id
interface UninstallServiceResponse {
  success: boolean;
  removedAt: string;
}

// PUT /api/services/:id/config
interface UpdateServiceConfigRequest {
  config: Partial<ServiceConfig>;
}

interface UpdateServiceConfigResponse {
  success: boolean;
  config: ServiceConfig;
  restartRequired: boolean;
}

// GET /api/services/:id/logs
interface GetServiceLogsRequest {
  since?: string;
  until?: string;
  limit?: number;
  follow?: boolean;
}

interface GetServiceLogsResponse {
  logs: ServiceLog[];
  hasMore: boolean;
}
```

#### 3.2.3 应用市场

```typescript
// GET /api/marketplace/categories
interface GetCategoriesResponse {
  categories: ApplicationCategory[];
}

// GET /api/marketplace/applications
interface GetApplicationsRequest {
  category?: string;
  search?: string;
  tags?: string[];
  featured?: boolean;
  sort?: 'name' | 'rating' | 'downloads' | 'updated';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface GetApplicationsResponse {
  applications: Application[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    categories: { id: string; name: string; count: number; }[];
    tags: { name: string; count: number; }[];
  };
}

// GET /api/marketplace/applications/:id
interface GetApplicationResponse {
  application: Application;
  similar: Application[];
  reviews: ApplicationReview[];
}

// POST /api/marketplace/applications/:id/install
interface InstallApplicationRequest {
  configuration?: {
    environment?: Record<string, string>;
    subdomain?: string;
    autoStart?: boolean;
  };
}

interface InstallApplicationResponse {
  installationId: string;
  serviceId: string;
  status: 'pending';
  estimatedDuration: number; // 秒
}

// GET /api/marketplace/installations/:id
interface GetInstallationResponse {
  installation: {
    id: string;
    applicationId: string;
    serviceId?: string;
    status: 'pending' | 'installing' | 'success' | 'failed';
    progress: number;
    currentStep: string;
    steps: InstallationStep[];
    error?: string;
    startedAt: string;
    completedAt?: string;
  };
}

interface InstallationStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}
```

#### 3.2.4 域名管理

```typescript
// GET /api/domains/config
interface GetDomainConfigResponse {
  config: DomainConfiguration;
}

// POST /api/domains/custom
interface AddCustomDomainRequest {
  domain: string;
}

interface AddCustomDomainResponse {
  customDomain: CustomDomain;
  dnsInstructions: {
    records: DNSRecord[];
    instructions: string[];
  };
}

// PUT /api/domains/custom/:id
interface UpdateCustomDomainRequest {
  autoRenewSSL?: boolean;
  enabled?: boolean;
}

// DELETE /api/domains/custom/:id

// POST /api/domains/custom/:id/verify
interface VerifyCustomDomainResponse {
  verified: boolean;
  dnsStatus: DNSStatus;
  sslStatus?: SSLStatus;
  issues?: string[];
}

// POST /api/domains/switch-primary
interface SwitchPrimaryDomainRequest {
  domain: string; // 可以是官方域名或自定义域名
}

// GET /api/domains/subdomains
interface GetSubdomainsResponse {
  subdomains: SubdomainMapping[];
  available: string[]; // 可用的子域名前缀
}

// POST /api/domains/subdomains
interface CreateSubdomainRequest {
  subdomain: string;
  serviceId: string;
}
```

#### 3.2.5 DDNS 管理

```typescript
// GET /api/ddns/config
interface GetDDNSConfigResponse {
  config: DDNSConfig;
}

// PUT /api/ddns/config
interface UpdateDDNSConfigRequest {
  enabled: boolean;
  interval?: number;
  provider?: string;
}

// POST /api/ddns/sync
interface SyncDDNSResponse {
  success: boolean;
  oldIP?: string;
  newIP: string;
  updatedAt: string;
}

// GET /api/ddns/logs
interface GetDDNSLogsRequest {
  page?: number;
  limit?: number;
  type?: 'update' | 'check' | 'error';
}

interface GetDDNSLogsResponse {
  logs: DDNSLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
```

#### 3.2.6 系统设置

```typescript
// GET /api/settings
interface GetSettingsResponse {
  settings: SystemConfiguration;
}

// PUT /api/settings/system
interface UpdateSystemSettingsRequest {
  settings: Partial<SystemSettings>;
}

// PUT /api/settings/security
interface UpdateSecuritySettingsRequest {
  settings: Partial<SecuritySettings>;
}

// GET /api/settings/logs
interface GetSystemLogsRequest {
  level?: 'debug' | 'info' | 'warn' | 'error';
  since?: string;
  limit?: number;
}

interface GetSystemLogsResponse {
  logs: {
    timestamp: string;
    level: string;
    message: string;
    module: string;
    details?: any;
  }[];
  hasMore: boolean;
}

// POST /api/settings/backup
interface CreateBackupResponse {
  backupId: string;
  size: number;
  createdAt: string;
  downloadUrl: string;
}

// POST /api/settings/restore
interface RestoreBackupRequest {
  backupId: string;
}

interface RestoreBackupResponse {
  success: boolean;
  restoredAt: string;
  restartRequired: boolean;
}
```

#### 3.2.7 用户管理

```typescript
// GET /api/user/profile
interface GetUserProfileResponse {
  user: User;
}

// PUT /api/user/profile
interface UpdateUserProfileRequest {
  displayName?: string;
  email?: string;
  avatar?: string;
}

// PUT /api/user/preferences
interface UpdateUserPreferencesRequest {
  preferences: Partial<UserPreferences>;
}

// POST /api/user/change-password
interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// GET /api/user/sessions
interface GetUserSessionsResponse {
  sessions: {
    id: string;
    device: string;
    ip: string;
    location?: string;
    createdAt: string;
    lastUsed: string;
    current: boolean;
  }[];
}

// DELETE /api/user/sessions/:id
```

### 3.3 实时数据 API

#### 3.3.1 WebSocket 事件

```typescript
// 连接认证
interface WebSocketAuth {
  type: 'auth';
  token: string;
}

// 订阅事件
interface WebSocketSubscribe {
  type: 'subscribe';
  channels: string[];
}

// 服务状态变化
interface ServiceStatusEvent {
  type: 'service.status.changed';
  data: {
    serviceId: string;
    status: ServiceStatus;
    timestamp: string;
  };
}

// 安装进度更新
interface InstallationProgressEvent {
  type: 'installation.progress';
  data: {
    installationId: string;
    progress: number;
    currentStep: string;
    status: 'installing' | 'success' | 'failed';
  };
}

// 资源使用更新
interface ResourceUsageEvent {
  type: 'resource.usage';
  data: {
    serviceId: string;
    usage: ResourceUsage;
    timestamp: string;
  };
}

// 系统通知
interface SystemNotificationEvent {
  type: 'system.notification';
  data: {
    id: string;
    title: string;
    message: string;
    level: 'info' | 'warn' | 'error';
    timestamp: string;
  };
}

// DDNS 更新
interface DDNSUpdateEvent {
  type: 'ddns.updated';
  data: {
    domain: string;
    oldIP?: string;
    newIP: string;
    timestamp: string;
  };
}
```

## 4. Mock 实现策略

### 4.1 Mock Service Worker 配置

```typescript
// mock/browser.ts
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

// 开发环境启动
if (process.env.NODE_ENV === 'development') {
  worker.start({
    onUnhandledRequest: 'warn',
    serviceWorker: {
      url: '/mockServiceWorker.js'
    }
  });
}
```

### 4.2 数据持久化策略

```typescript
// mock/storage.ts
class MockStorage {
  private prefix = 'mixbox_mock_';

  // 保存数据到 localStorage
  save<T>(key: string, data: T): void {
    localStorage.setItem(
      this.prefix + key, 
      JSON.stringify(data)
    );
  }

  // 从 localStorage 读取数据
  load<T>(key: string, defaultValue: T): T {
    const stored = localStorage.getItem(this.prefix + key);
    return stored ? JSON.parse(stored) : defaultValue;
  }

  // 清除数据
  clear(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  // 清除所有 Mock 数据
  clearAll(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .forEach(key => localStorage.removeItem(key));
  }
}

export const mockStorage = new MockStorage();
```

### 4.3 实时数据模拟

```typescript
// mock/realtime.ts
class RealtimeDataSimulator {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private callbacks: Map<string, Function[]> = new Map();

  // 模拟服务状态变化
  simulateServiceStatus(serviceId: string) {
    const interval = setInterval(() => {
      const event: ServiceStatusEvent = {
        type: 'service.status.changed',
        data: {
          serviceId,
          status: this.randomServiceStatus(),
          timestamp: new Date().toISOString()
        }
      };
      this.emit('service.status.changed', event);
    }, 30000); // 30秒更新一次

    this.intervals.set(`service_${serviceId}`, interval);
  }

  // 模拟安装进度
  simulateInstallation(installationId: string) {
    let progress = 0;
    const steps = ['下载镜像', '配置域名', '设置SSO', '启动服务'];
    let currentStepIndex = 0;

    const interval = setInterval(() => {
      progress += Math.random() * 20;
      
      if (progress >= 100 * (currentStepIndex + 1) / steps.length) {
        currentStepIndex++;
      }

      const event: InstallationProgressEvent = {
        type: 'installation.progress',
        data: {
          installationId,
          progress: Math.min(progress, 100),
          currentStep: steps[currentStepIndex] || '完成',
          status: progress >= 100 ? 'success' : 'installing'
        }
      };

      this.emit('installation.progress', event);

      if (progress >= 100) {
        clearInterval(interval);
        this.intervals.delete(`installation_${installationId}`);
      }
    }, 1000);

    this.intervals.set(`installation_${installationId}`, interval);
  }

  // 事件发射器
  private emit(eventType: string, data: any) {
    const callbacks = this.callbacks.get(eventType) || [];
    callbacks.forEach(callback => callback(data));
  }

  // 订阅事件
  subscribe(eventType: string, callback: Function) {
    const callbacks = this.callbacks.get(eventType) || [];
    callbacks.push(callback);
    this.callbacks.set(eventType, callbacks);
  }

  // 清理资源
  cleanup() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    this.callbacks.clear();
  }

  private randomServiceStatus(): ServiceStatus {
    const statuses: ServiceStatus[] = ['running', 'stopped', 'error'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }
}

export const realtimeSimulator = new RealtimeDataSimulator();
```

### 4.4 错误场景模拟

```typescript
// mock/errors.ts
export class MockErrorGenerator {
  private errorRate = 0.05; // 5% 错误率

  // 随机生成错误
  shouldGenerateError(): boolean {
    return Math.random() < this.errorRate;
  }

  // 生成认证错误
  generateAuthError(): ApiError {
    const errors = [
      { code: 'INVALID_CREDENTIALS', message: '用户名或密码错误' },
      { code: 'USER_NOT_FOUND', message: '用户不存在' },
      { code: 'ACCOUNT_LOCKED', message: '账户已被锁定' },
      { code: 'TOKEN_EXPIRED', message: '登录已过期，请重新登录' }
    ];
    return errors[Math.floor(Math.random() * errors.length)];
  }

  // 生成服务错误
  generateServiceError(): ApiError {
    const errors = [
      { code: 'SERVICE_NOT_FOUND', message: '服务不存在' },
      { code: 'SERVICE_START_FAILED', message: '服务启动失败' },
      { code: 'INSUFFICIENT_RESOURCES', message: '系统资源不足' },
      { code: 'PORT_ALREADY_IN_USE', message: '端口已被占用' }
    ];
    return errors[Math.floor(Math.random() * errors.length)];
  }

  // 生成网络错误
  generateNetworkError(): ApiError {
    const errors = [
      { code: 'NETWORK_TIMEOUT', message: '网络连接超时' },
      { code: 'CONNECTION_REFUSED', message: '连接被拒绝' },
      { code: 'DNS_RESOLUTION_FAILED', message: 'DNS 解析失败' }
    ];
    return errors[Math.floor(Math.random() * errors.length)];
  }
}

export const mockErrorGenerator = new MockErrorGenerator();
```

## 5. API 使用示例

### 5.1 认证流程

```typescript
// 用户登录
const login = async (credentials: LoginCredentials) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    const data: ApiResponse<LoginResponse> = await response.json();
    
    if (data.success) {
      // 保存用户信息和 Token
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      return data.data;
    } else {
      throw new Error(data.error?.message || '登录失败');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
```

### 5.2 服务管理

```typescript
// 获取服务列表
const getServices = async (): Promise<Service[]> => {
  const response = await authenticatedFetch('/api/services');
  const data: ApiResponse<GetServicesResponse> = await response.json();
  return data.data.services;
};

// 安装应用
const installApplication = async (
  applicationId: string, 
  config?: InstallApplicationRequest
) => {
  const response = await authenticatedFetch(
    `/api/marketplace/applications/${applicationId}/install`,
    {
      method: 'POST',
      body: JSON.stringify(config)
    }
  );
  
  const data: ApiResponse<InstallApplicationResponse> = await response.json();
  return data.data;
};

// 监听安装进度
const watchInstallation = (installationId: string) => {
  const eventSource = new EventSource(
    `/api/marketplace/installations/${installationId}/events`
  );
  
  eventSource.onmessage = (event) => {
    const progressEvent: InstallationProgressEvent = JSON.parse(event.data);
    updateInstallationProgress(progressEvent.data);
  };
  
  eventSource.onerror = (error) => {
    console.error('Installation progress error:', error);
    eventSource.close();
  };
};
```

### 5.3 实时数据订阅

```typescript
// WebSocket 连接
const connectWebSocket = () => {
  const token = localStorage.getItem('authToken');
  const ws = new WebSocket('ws://localhost:3000/ws');
  
  ws.onopen = () => {
    // 认证
    ws.send(JSON.stringify({
      type: 'auth',
      token
    }));
    
    // 订阅事件
    ws.send(JSON.stringify({
      type: 'subscribe',
      channels: ['service.status', 'installation.progress', 'system.notification']
    }));
  };
  
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    handleRealtimeEvent(message);
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  return ws;
};

// 处理实时事件
const handleRealtimeEvent = (event: any) => {
  switch (event.type) {
    case 'service.status.changed':
      updateServiceStatus(event.data);
      break;
    case 'installation.progress':
      updateInstallationProgress(event.data);
      break;
    case 'system.notification':
      showNotification(event.data);
      break;
  }
};
```

## 6. 错误处理规范

### 6.1 HTTP 状态码使用

```typescript
// 状态码映射
const HTTP_STATUS_CODES = {
  // 成功
  200: 'OK',                    // 请求成功
  201: 'Created',               // 资源创建成功
  202: 'Accepted',              // 请求已接受，处理中
  204: 'No Content',            // 请求成功，无返回内容
  
  // 客户端错误
  400: 'Bad Request',           // 请求格式错误
  401: 'Unauthorized',          // 未认证
  403: 'Forbidden',             // 权限不足
  404: 'Not Found',             // 资源不存在
  409: 'Conflict',              // 资源冲突
  422: 'Unprocessable Entity',  // 数据验证失败
  429: 'Too Many Requests',     // 请求过于频繁
  
  // 服务端错误
  500: 'Internal Server Error', // 服务器内部错误
  502: 'Bad Gateway',           // 网关错误
  503: 'Service Unavailable',   // 服务不可用
  504: 'Gateway Timeout'        // 网关超时
} as const;
```

### 6.2 统一错误响应格式

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
  };
}

// 错误代码定义
const ERROR_CODES = {
  // 认证相关
  AUTH_INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  AUTH_INSUFFICIENT_PRIVILEGES: 'INSUFFICIENT_PRIVILEGES',
  
  // 服务相关
  SERVICE_NOT_FOUND: 'SERVICE_NOT_FOUND',
  SERVICE_ALREADY_EXISTS: 'SERVICE_ALREADY_EXISTS',
  SERVICE_START_FAILED: 'SERVICE_START_FAILED',
  
  // 域名相关
  DOMAIN_ALREADY_EXISTS: 'DOMAIN_ALREADY_EXISTS',
  DOMAIN_VERIFICATION_FAILED: 'DOMAIN_VERIFICATION_FAILED',
  DNS_RESOLUTION_FAILED: 'DNS_RESOLUTION_FAILED',
  
  // 系统相关
  INSUFFICIENT_RESOURCES: 'INSUFFICIENT_RESOURCES',
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  VALIDATION_ERROR: 'VALIDATION_ERROR'
} as const;
```

## 7. API 版本控制

### 7.1 版本策略
- **URL 版本控制**: `/api/v1/`, `/api/v2/`
- **语义化版本**: 遵循 SemVer 规范
- **向后兼容**: 新版本保持向后兼容
- **废弃通知**: 提前通知 API 废弃计划

### 7.2 版本迁移
```typescript
// API 版本兼容性配置
interface ApiVersionConfig {
  version: string;
  deprecated?: boolean;
  deprecationDate?: string;
  migrationGuide?: string;
  supportedUntil?: string;
}

const API_VERSIONS: Record<string, ApiVersionConfig> = {
  'v1': {
    version: '1.0.0',
    deprecated: false
  },
  'v2': {
    version: '2.0.0',
    deprecated: false
  }
};
```

---

本 API 设计文档定义了 MixBox 用户端的完整 API 规范，包括数据模型、端点设计、Mock 实现策略和使用示例。这个设计确保了前端开发的顺利进行，同时为后期集成真实后端奠定了基础。