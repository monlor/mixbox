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
  private proxyRules: Map<string, ProxyRule> = new Map();
  private defaultDomain: string = 'mixbox.local';

  constructor() {
    this.initializeProxyRules();
  }

  async initializeProxyRules() {
    try {
      // 获取系统设置中的默认域名
      const settings = await storage.getSettings('system');
      if (settings?.defaultDomain) {
        this.defaultDomain = settings.defaultDomain;
      }

      // 获取所有运行中的服务并设置代理规则
      await this.updateProxyRules();
    } catch (error) {
      console.error('Failed to initialize proxy rules:', error);
    }
  }

  async updateProxyRules() {
    try {
      const services = await dockerOperations.listServices();
      this.proxyRules.clear();

      for (const service of services) {
        if (service.status === 'running' && service.name !== 'mixbox-proxy') {
          const subdomain = service.name;
          const port = this.extractPort(service.ports);
          
          if (port) {
            const rule: ProxyRule = {
              subdomain,
              serviceName: service.name,
              port,
              target: `http://localhost:${port}`
            };
            
            this.proxyRules.set(subdomain, rule);
            console.log(`🌐 Proxy rule added: ${subdomain}.${this.defaultDomain} -> ${rule.target}`);
          }
        }
      }
    } catch (error) {
      console.error('Failed to update proxy rules:', error);
    }
  }

  private extractPort(ports: string[]): number | null {
    if (!ports || ports.length === 0) return null;
    
    // 查找主机端口映射，格式如 "8080:80"
    for (const portMapping of ports) {
      const match = portMapping.match(/^(\d+):/);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
    
    return null;
  }

  getProxyRule(subdomain: string): ProxyRule | undefined {
    return this.proxyRules.get(subdomain);
  }

  getAllRules(): ProxyRule[] {
    return Array.from(this.proxyRules.values());
  }

  async addServiceProxy(serviceName: string, port: number): Promise<string> {
    const subdomain = serviceName;
    const domain = `${subdomain}.${this.defaultDomain}`;
    
    const rule: ProxyRule = {
      subdomain,
      serviceName,
      port,
      target: `http://localhost:${port}`
    };
    
    this.proxyRules.set(subdomain, rule);
    console.log(`🌐 Added proxy: ${domain} -> ${rule.target}`);
    
    return domain;
  }

  removeServiceProxy(serviceName: string) {
    this.proxyRules.delete(serviceName);
    console.log(`🌐 Removed proxy for service: ${serviceName}`);
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

// 代理中间件工厂函数
export function createDynamicProxy() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const host = req.get('host');
    if (!host) {
      return next();
    }

    // 解析子域名
    const hostParts = host.split('.');
    if (hostParts.length < 2) {
      return next();
    }

    const subdomain = hostParts[0];
    const proxyRule = proxyManager.getProxyRule(subdomain);

    if (!proxyRule) {
      return next();
    }

    // 创建代理中间件
    const proxyOptions = {
      target: proxyRule.target,
      changeOrigin: true,
      ws: true, // 支持WebSocket
      timeout: 30000,
      proxyTimeout: 30000,
      onError: (err: any, req: any, res: any) => {
        console.error(`Proxy error for ${subdomain}:`, err.message);
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
export function generateProxyStatusPage(): string {
  const rules = proxyManager.getAllRules();
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