// Mock data for development mode
export const mockApplications = [
  {
    id: "rsshub",
    name: "rsshub",
    displayName: "RSSHub",
    description: "🍰 Everything is RSSible - RSS 聚合器，支持各种奇怪的格式",
    category: "network-tools",
    version: "latest",
    stars: 28500,
    port: 1200,
    isInstalled: false,
    yaml: `version: '3.8'
services:
  rsshub:
    image: diygod/rsshub:latest
    container_name: rsshub
    ports:
      - "1200:1200"
    environment:
      NODE_ENV: production
      CACHE_TYPE: redis
      REDIS_URL: redis://redis:6379/
    depends_on:
      - redis
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.rsshub.rule=Host(\`rsshub.{DEFAULT_DOMAIN}\`)"
      - "traefik.http.services.rsshub.loadbalancer.server.port=1200"

  redis:
    image: redis:alpine
    container_name: rsshub-redis
    restart: unless-stopped
    volumes:
      - redis_data:/data

volumes:
  redis_data:`
  },
  {
    id: "grafana",
    name: "grafana",
    displayName: "Grafana",
    description: "📊 开源可观测平台，用于监控和分析指标数据",
    category: "monitoring",
    version: "latest",
    stars: 58900,
    port: 3000,
    isInstalled: false,
    yaml: `version: '3.8'
services:
  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_SERVER_DOMAIN={DEFAULT_DOMAIN}
      - GF_SERVER_ROOT_URL=https://grafana.{DEFAULT_DOMAIN}
    volumes:
      - grafana_data:/var/lib/grafana
      - grafana_config:/etc/grafana
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.grafana.rule=Host(\`grafana.{DEFAULT_DOMAIN}\`)"
      - "traefik.http.services.grafana.loadbalancer.server.port=3000"

volumes:
  grafana_data:
  grafana_config:`
  },
  {
    id: "portainer",
    name: "portainer",
    displayName: "Portainer",
    description: "🐳 Docker 容器管理界面，轻量级容器管理解决方案",
    category: "dev-tools",
    version: "latest",
    stars: 28100,
    port: 9000,
    isInstalled: false,
    yaml: `version: '3.8'
services:
  portainer:
    image: portainer/portainer-ce:latest
    container_name: portainer
    ports:
      - "9000:9000"
      - "9443:9443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer_data:/data
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.portainer.rule=Host(\`portainer.{DEFAULT_DOMAIN}\`)"
      - "traefik.http.services.portainer.loadbalancer.server.port=9000"

volumes:
  portainer_data:`
  },
  {
    id: "redis",
    name: "redis",
    displayName: "Redis",
    description: "⚡ 内存数据库，高性能键值存储",
    category: "database",
    version: "alpine",
    stars: 62400,
    port: 6379,
    isInstalled: false,
    yaml: `version: '3.8'
services:
  redis:
    image: redis:alpine
    container_name: redis
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes --requirepass redis123
    volumes:
      - redis_data:/data
    restart: unless-stopped
    labels:
      - "traefik.enable=false"

volumes:
  redis_data:`
  },
  {
    id: "nginx",
    name: "nginx",
    displayName: "Nginx",
    description: "🌐 高性能Web服务器和反向代理",
    category: "network-tools",
    version: "alpine",
    stars: 15200,
    port: 80,
    isInstalled: false,
    yaml: `version: '3.8'
services:
  nginx:
    image: nginx:alpine
    container_name: nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - nginx_conf:/etc/nginx/conf.d
      - nginx_html:/usr/share/nginx/html
      - nginx_logs:/var/log/nginx
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.nginx.rule=Host(\`web.{DEFAULT_DOMAIN}\`)"
      - "traefik.http.services.nginx.loadbalancer.server.port=80"

volumes:
  nginx_conf:
  nginx_html:
  nginx_logs:`
  },
  {
    id: "prometheus",
    name: "prometheus",
    displayName: "Prometheus",
    description: "🔥 开源监控和告警工具包",
    category: "monitoring",
    version: "latest",
    stars: 52300,
    port: 9090,
    isInstalled: false,
    yaml: `version: '3.8'
services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-lifecycle'
    volumes:
      - prometheus_config:/etc/prometheus
      - prometheus_data:/prometheus
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.prometheus.rule=Host(\`prometheus.{DEFAULT_DOMAIN}\`)"
      - "traefik.http.services.prometheus.loadbalancer.server.port=9090"

volumes:
  prometheus_config:
  prometheus_data:`
  }
];

export const mockServices = [
  {
    id: "service-1",
    name: "rsshub",
    displayName: "RSSHub",
    description: "RSS 聚合服务",
    status: "running",
    port: 1200,
    domain: "rsshub.mixbox.com",
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: "service-2", 
    name: "grafana",
    displayName: "Grafana",
    description: "监控仪表板",
    status: "stopped",
    port: 3000,
    domain: "grafana.mixbox.com",
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date()
  }
];

// Mock Docker operations
export class MockDockerService {
  private services: Map<string, any> = new Map();
  
  constructor() {
    // Initialize with some mock services
    mockServices.forEach(service => {
      this.services.set(service.id, service);
    });
  }

  async createService(config: any): Promise<any> {
    const serviceId = `service-${Date.now()}`;
    const service = {
      id: serviceId,
      name: config.name,
      displayName: config.displayName,
      description: config.description,
      status: 'stopped',
      port: config.port,
      domain: `${config.name}.mixbox.com`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.services.set(serviceId, service);
    
    // Simulate Docker container creation delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return service;
  }

  async startService(serviceId: string): Promise<void> {
    const service = this.services.get(serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    // Simulate Docker start delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    service.status = 'running';
    service.updatedAt = new Date();
    this.services.set(serviceId, service);
  }

  async stopService(serviceId: string): Promise<void> {
    const service = this.services.get(serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    // Simulate Docker stop delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    service.status = 'stopped';
    service.updatedAt = new Date();
    this.services.set(serviceId, service);
  }

  async removeService(serviceId: string): Promise<void> {
    // Simulate Docker removal delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.services.delete(serviceId);
  }

  async getServices(): Promise<any[]> {
    return Array.from(this.services.values());
  }

  async getServiceLogs(serviceId: string): Promise<string[]> {
    // Mock logs
    const mockLogs = [
      `[${new Date().toISOString()}] Starting service ${serviceId}`,
      `[${new Date().toISOString()}] Service initialized successfully`,
      `[${new Date().toISOString()}] Listening on port 3000`,
      `[${new Date().toISOString()}] Ready to accept connections`
    ];
    
    return mockLogs;
  }

  async getServiceStats(serviceId: string): Promise<any> {
    // Mock resource usage stats
    return {
      cpu: Math.random() * 100,
      memory: Math.random() * 512,
      network: {
        rx: Math.random() * 1024,
        tx: Math.random() * 512
      }
    };
  }
}

export const mockDockerService = new MockDockerService();