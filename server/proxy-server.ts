import { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { dockerOperations } from './docker-operations';
import { storage } from './storage';

export interface ProxyRule {
  subdomain: string;
  serviceName: string;
  port: number;
  target: string;
}

class ProxyManager {
  private defaultDomain: string = 'mixbox.local';

  constructor() {
    this.initializeProxy();
  }

  async initializeProxy() {
    try {
      // 获取系统设置中的默认域名
      const settings = await storage.getSettings('system');
      if (settings?.defaultDomain) {
        this.defaultDomain = settings.defaultDomain;
      }
      console.log(`🌐 Proxy server initialized with domain: ${this.defaultDomain}`);
    } catch (error) {
      console.error('Failed to initialize proxy:', error);
    }
  }

  async resolveServiceTarget(subdomain: string): Promise<ProxyRule | null> {
    try {
      // 获取所有服务
      const services = await dockerOperations.listServices();
      
      // 查找匹配的服务
      const service = services.find(s => s.name === subdomain && s.status === 'running');
      
      if (!service) {
        console.log(`🌐 Service '${subdomain}' not found or not running`);
        return null;
      }

      // 动态构建代理目标 - 使用Docker网络内的服务名和端口
      const internalPort = this.extractInternalPort(service.ports);
      if (!internalPort) {
        console.log(`🌐 No internal port found for service '${subdomain}'`);
        return null;
      }

      const target = `http://${service.name}:${internalPort}`;
      
      const rule: ProxyRule = {
        subdomain,
        serviceName: service.name,
        port: internalPort,
        target
      };

      console.log(`🌐 Dynamic proxy: ${subdomain}.${this.defaultDomain} -> ${target}`);
      return rule;
      
    } catch (error) {
      console.error(`Failed to resolve service target for ${subdomain}:`, error);
      return null;
    }
  }

  private extractInternalPort(ports: string[]): number | null {
    if (!ports || ports.length === 0) return null;
    
    // 查找端口映射，格式如 "8080:80"，我们需要内部端口（80）
    for (const portMapping of ports) {
      const match = portMapping.match(/^\d+:(\d+)$/);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
    
    return null;
  }

  async getAllActiveServices(): Promise<ProxyRule[]> {
    try {
      const services = await dockerOperations.listServices();
      const activeRules: ProxyRule[] = [];

      for (const service of services) {
        if (service.status === 'running' && service.name !== 'mixbox-proxy') {
          const internalPort = this.extractInternalPort(service.ports);
          if (internalPort) {
            const rule: ProxyRule = {
              subdomain: service.name,
              serviceName: service.name,
              port: internalPort,
              target: `http://${service.name}:${internalPort}`
            };
            activeRules.push(rule);
          }
        }
      }

      return activeRules;
    } catch (error) {
      console.error('Failed to get active services:', error);
      return [];
    }
  }

  getDefaultDomain(): string {
    return this.defaultDomain;
  }

  setDefaultDomain(domain: string) {
    this.defaultDomain = domain;
    console.log(`🌐 Updated default domain to: ${domain}`);
  }

  setDefaultDomain(domain: string) {
    this.defaultDomain = domain;
  }

  getDefaultDomain(): string {
    return this.defaultDomain;
  }
}

// 创建全局代理管理器实例
export const proxyManager = new ProxyManager();

// 动态代理中间件工厂函数
export function createDynamicProxy() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const host = req.get('host');
    if (!host) {
      return next();
    }

    // 解析子域名 - 检查是否为真正的子域名请求
    const hostParts = host.split('.');
    
    // 跳过非子域名请求 (如 localhost:5000, 127.0.0.1:5000 等)
    if (hostParts.length < 3) {
      return next();
    }

    const subdomain = hostParts[0];
    const baseDomain = hostParts.slice(1).join('.');
    
    // 跳过www和其他常见前缀
    if (subdomain === 'www' || subdomain === 'api') {
      return next();
    }

    // 只处理匹配默认域名的子域名请求
    const defaultDomain = proxyManager.getDefaultDomain();
    if (!baseDomain.includes(defaultDomain.split('.')[0])) {
      return next();
    }

    console.log(`🌐 Processing subdomain request: ${subdomain}.${baseDomain}`);

    // 动态解析服务目标
    const proxyRule = await proxyManager.resolveServiceTarget(subdomain);
    
    if (!proxyRule) {
      // 返回404而不是继续到下一个中间件
      return res.status(404).json({
        error: 'Service Not Found',
        message: `Service '${subdomain}' is not installed or not running`,
        subdomain: subdomain,
        availableDomain: `${subdomain}.${defaultDomain}`
      });
    }

    // 创建代理中间件
    const proxyOptions = {
      target: proxyRule.target,
      changeOrigin: true,
      ws: true, // 支持WebSocket
      timeout: 30000,
      proxyTimeout: 30000,
      onError: (err: any, req: any, res: any) => {
        console.error(`🌐 Proxy error for ${subdomain}:`, err.message);
        if (!res.headersSent) {
          res.status(502).json({
            error: 'Bad Gateway',
            message: `Service ${proxyRule.serviceName} is not responding`,
            subdomain: subdomain
          });
        }
      },
      onProxyReq: (proxyReq: any, req: any, res: any) => {
        console.log(`🔄 Proxying ${req.method} ${req.url} to ${proxyRule.target}`);
      }
    };

    const proxy = createProxyMiddleware(proxyOptions);
    return proxy(req, res, next);
  };
}

// 代理状态页面生成器
export async function generateProxyStatusPage(): Promise<string> {
  const rules = await proxyManager.getAllActiveServices();
  const defaultDomain = proxyManager.getDefaultDomain();
  
  return `
<!DOCTYPE html>
<html>
<head>
    <title>MixBox 代理状态</title>
    <meta charset="utf-8">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .services {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }
        .service-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .service-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
        }
        .service-url {
            color: #007bff;
            text-decoration: none;
            font-family: monospace;
            background: #f8f9fa;
            padding: 8px 12px;
            border-radius: 5px;
            display: inline-block;
            margin-bottom: 10px;
        }
        .service-url:hover {
            background: #e9ecef;
        }
        .service-target {
            color: #666;
            font-size: 14px;
            font-family: monospace;
        }
        .status {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            color: white;
            background: #28a745;
        }
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌐 MixBox 内置代理服务器</h1>
        <p>自动为所有运行中的服务分配子域名访问</p>
        <p><strong>默认域名:</strong> ${defaultDomain}</p>
        <p><strong>活跃代理规则:</strong> ${rules.length} 个</p>
    </div>
    
    ${rules.length > 0 ? `
    <div class="services">
        ${rules.map(rule => `
        <div class="service-card">
            <div class="service-name">${rule.serviceName}</div>
            <a href="http://${rule.subdomain}.${defaultDomain}" target="_blank" class="service-url">
                ${rule.subdomain}.${defaultDomain}
            </a>
            <div class="service-target">→ ${rule.target}</div>
            <div style="margin-top: 10px;">
                <span class="status">运行中</span>
            </div>
        </div>
        `).join('')}
    </div>
    ` : `
    <div class="empty-state">
        <h3>暂无活跃的代理规则</h3>
        <p>启动一些服务后，它们会自动出现在这里</p>
    </div>
    `}
    
    <script>
        // 每30秒刷新一次页面以更新状态
        setTimeout(() => location.reload(), 30000);
    </script>
</body>
</html>
  `;
}