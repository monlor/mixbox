import * as fs from 'fs';
import * as path from 'path';
import yaml from 'js-yaml';

// Load applications from local YAML files
function loadApplicationsFromYaml() {
  const appsDir = path.join(process.cwd(), 'apps');
  const applications = [];

  if (!fs.existsSync(appsDir)) {
    console.warn('Apps directory not found, using empty array');
    return [];
  }

  const files = fs.readdirSync(appsDir);
  
  for (const file of files) {
    if (file.endsWith('.yaml') || file.endsWith('.yml')) {
      try {
        const filePath = path.join(appsDir, file);
        const yamlContent = fs.readFileSync(filePath, 'utf8');
        const appData = yaml.load(yamlContent) as any;
        
        if (appData.metadata) {
          applications.push({
            id: appData.metadata.id || file.replace(/\.(yaml|yml)$/, ''),
            name: appData.metadata.name || file.replace(/\.(yaml|yml)$/, ''),
            displayName: appData.metadata.displayName || appData.metadata.name,
            description: appData.metadata.description || '',
            category: appData.metadata.category || 'other',
            version: appData.metadata.version || 'latest',
            stars: appData.metadata.stars || 0,
            port: appData.metadata.mainPort || 80,
            icon: appData.metadata.icon || '',
            author: appData.metadata.author || '',
            website: appData.metadata.website || '',
            isInstalled: false,
            hasUpdate: false,
            yaml: yamlContent
          });
        }
      } catch (error) {
        console.error(`Error loading ${file}:`, error);
      }
    }
  }
  
  return applications;
}

// Mock data for development mode
export const mockApplications = loadApplicationsFromYaml();

// Log loaded applications for debugging
console.log(`Loaded ${mockApplications.length} applications from local YAML files:`, 
  mockApplications.map(app => ({ id: app.id, name: app.displayName }))
);

// Mock services data

export const mockServices = [
  {
    id: "service-1",
    name: "rsshub",
    displayName: "RSSHub",
    description: "RSS 聚合服务",
    status: "running",
    port: 1200,
    domain: "rsshub.mixbox.com",
    version: "2024.01.10", // Older version to test update detection
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
    version: "10.2.3", // Same version, no update
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
    // Check if service with same name already exists (for updates)
    const existingService = Array.from(this.services.values())
      .find(service => service.name === config.name);
    
    if (existingService) {
      // Update existing service (this is an update, not a new installation)
      existingService.version = config.version || 'latest';
      existingService.updatedAt = new Date();
      existingService.description = config.description;
      
      // Simulate update delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return existingService;
    } else {
      // Create new service
      const serviceId = `service-${Date.now()}`;
      const service = {
        id: serviceId,
        name: config.name,
        displayName: config.displayName,
        description: config.description,
        status: 'stopped',
        port: config.port,
        domain: config.domain || `${config.name}.mixbox.com`,
        version: config.version || 'latest',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.services.set(serviceId, service);
      
      // Simulate Docker container creation delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return service;
    }
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