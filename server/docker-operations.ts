import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

const execAsync = promisify(exec);

// Environment variable to control mock mode (default: true for development)
const USE_MOCK = process.env.USE_MOCK !== 'false';

console.log(`🔧 Docker Operations Mode: ${USE_MOCK ? 'MOCK' : 'REAL'} (USE_MOCK=${process.env.USE_MOCK || 'undefined'})`);

export interface DockerService {
  id: string;
  name: string;
  displayName: string;
  status: 'running' | 'stopped' | 'starting' | 'stopping';
  ports: string[];
  domain: string;
  image: string;
  version: string;
  uptime: string;
  cpuUsage: number;
  memoryUsage: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DockerOperations {
  listServices(): Promise<DockerService[]>;
  startService(serviceId: string): Promise<void>;
  stopService(serviceId: string): Promise<void>;
  removeService(serviceId: string, deleteData?: boolean): Promise<void>;
  getServiceLogs(serviceId: string): Promise<string[]>;
  deployService(config: any, envVars?: Record<string, string>): Promise<DockerService>;
  checkServiceStatus(serviceId: string): Promise<'running' | 'stopped'>;
}

// Mock Docker Operations Class
class MockDockerOperations implements DockerOperations {
  private services = new Map<string, DockerService>();

  constructor() {
    console.log('🔧 Using Mock Docker Operations');
    // Initialize with sample services
    this.initializeMockServices();
  }

  private initializeMockServices() {
    const mockServices: DockerService[] = [
      {
        id: 'service-1',
        name: 'rsshub',
        displayName: 'RSSHub',
        status: 'running',
        ports: ['1200:1200'],
        domain: 'rsshub.mixbox.local',
        image: 'diygod/rsshub',
        version: 'latest',
        uptime: '2天 3小时',
        cpuUsage: 15.6,
        memoryUsage: 128.5,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'service-2',
        name: 'nginx',
        displayName: 'Nginx Proxy',
        status: 'running',
        ports: ['80:80', '443:443'],
        domain: 'proxy.mixbox.local',
        image: 'nginx',
        version: '1.25-alpine',
        uptime: '5天 12小时',
        cpuUsage: 8.2,
        memoryUsage: 64.8,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'service-3',
        name: 'portainer',
        displayName: 'Portainer',
        status: 'stopped',
        ports: ['9000:9000'],
        domain: 'portainer.mixbox.local',
        image: 'portainer/portainer-ce',
        version: '2.19.4',
        uptime: '0分钟',
        cpuUsage: 0,
        memoryUsage: 0,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      }
    ];

    mockServices.forEach(service => {
      this.services.set(service.id, service);
    });
  }

  async listServices(): Promise<DockerService[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    return Array.from(this.services.values());
  }

  async startService(serviceId: string): Promise<void> {
    const service = this.services.get(serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    service.status = 'starting';
    this.services.set(serviceId, service);

    // Simulate startup time
    await new Promise(resolve => setTimeout(resolve, 2000));

    service.status = 'running';
    service.uptime = '刚刚启动';
    service.updatedAt = new Date();
    this.services.set(serviceId, service);
  }

  async stopService(serviceId: string): Promise<void> {
    const service = this.services.get(serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    service.status = 'stopping';
    this.services.set(serviceId, service);

    // Simulate shutdown time
    await new Promise(resolve => setTimeout(resolve, 1500));

    service.status = 'stopped';
    service.uptime = '0分钟';
    service.cpuUsage = 0;
    service.memoryUsage = 0;
    service.updatedAt = new Date();
    this.services.set(serviceId, service);
  }

  async removeService(serviceId: string, deleteData: boolean = false): Promise<void> {
    const service = this.services.get(serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    // Simulate removal delay based on whether data is being deleted
    const delay = deleteData ? 3000 : 1500;
    await new Promise(resolve => setTimeout(resolve, delay));

    console.log(`Mock: Removing service ${service.displayName} (deleteData: ${deleteData})`);
    this.services.delete(serviceId);
  }

  async getServiceLogs(serviceId: string): Promise<string[]> {
    const service = this.services.get(serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    // Simulate log fetching delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock logs based on service status
    if (service.status === 'running') {
      return [
        `[${new Date().toISOString()}] ${service.displayName} started successfully`,
        `[${new Date().toISOString()}] Listening on port ${service.ports[0]?.split(':')[1] || '8080'}`,
        `[${new Date().toISOString()}] Health check passed`,
        `[${new Date().toISOString()}] Processing requests...`,
      ];
    } else {
      return [
        `[${new Date().toISOString()}] ${service.displayName} is stopped`,
        `[${new Date().toISOString()}] No active processes`,
      ];
    }
  }

  async deployService(config: any, envVars?: Record<string, string>): Promise<DockerService> {
    // Simulate deployment time
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('Deploying service with config:', JSON.stringify(config, null, 2));

    // Ensure config has required structure
    if (!config.metadata || !config.metadata.name) {
      throw new Error('Invalid configuration: missing metadata.name');
    }

    const mainServiceName = config.metadata.name;
    const mainService = config.services?.[mainServiceName];
    
    if (!mainService) {
      throw new Error(`Main service '${mainServiceName}' not found in services configuration`);
    }

    const serviceId = `service-${Date.now()}`;
    const service: DockerService = {
      id: serviceId,
      name: config.metadata.name,
      displayName: config.metadata.displayName || config.metadata.name,
      status: 'running',
      ports: mainService.ports || [],
      domain: `${config.metadata.name}.mixbox.local`,
      image: mainService.image || 'unknown',
      version: config.metadata.version || 'latest',
      uptime: '刚刚部署',
      cpuUsage: Math.random() * 20,
      memoryUsage: Math.random() * 200 + 50,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.services.set(serviceId, service);
    return service;
  }

  async checkServiceStatus(serviceId: string): Promise<'running' | 'stopped'> {
    const service = this.services.get(serviceId);
    return service?.status === 'running' ? 'running' : 'stopped';
  }
}

// Real Docker Operations Class
class RealDockerOperations implements DockerOperations {
  constructor() {
    console.log('🐳 Using Real Docker Operations');
  }

  async listServices(): Promise<DockerService[]> {
    try {
      // List all containers with mixbox network
      const { stdout } = await execAsync(
        'docker ps -a --filter "network=mixbox" --format "{{.ID}},{{.Names}},{{.Image}},{{.Status}},{{.Ports}},{{.CreatedAt}}"'
      );

      const services: DockerService[] = [];
      const lines = stdout.trim().split('\n').filter(line => line);

      for (const line of lines) {
        const [id, name, image, status, ports, createdAt] = line.split(',');
        
        // Get detailed stats
        const stats = await this.getContainerStats(id);
        
        services.push({
          id: id.substring(0, 12), // Short container ID
          name: name,
          displayName: this.formatDisplayName(name),
          status: this.parseStatus(status),
          ports: this.parsePorts(ports),
          domain: `${name}.mixbox.local`,
          image: image,
          version: this.extractVersion(image),
          uptime: this.calculateUptime(status),
          cpuUsage: stats.cpu,
          memoryUsage: stats.memory,
          createdAt: new Date(createdAt),
          updatedAt: new Date(),
        });
      }

      return services;
    } catch (error) {
      console.error('Error listing Docker services:', error);
      return [];
    }
  }

  async startService(serviceId: string): Promise<void> {
    try {
      await execAsync(`docker start ${serviceId}`);
      // Wait for container to be ready
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      throw new Error(`Failed to start service: ${error}`);
    }
  }

  async stopService(serviceId: string): Promise<void> {
    try {
      await execAsync(`docker stop ${serviceId}`);
    } catch (error) {
      throw new Error(`Failed to stop service: ${error}`);
    }
  }

  async removeService(serviceId: string, deleteData: boolean = false): Promise<void> {
    try {
      // Stop container first
      await execAsync(`docker stop ${serviceId}`).catch(() => {
        // Ignore error if already stopped
      });

      // Remove container
      await execAsync(`docker rm ${serviceId}`);

      // Remove volumes if deleteData is true
      if (deleteData) {
        try {
          const { stdout } = await execAsync(`docker volume ls -q --filter "name=${serviceId}"`);
          const volumes = stdout.trim().split('\n').filter(v => v);
          
          for (const volume of volumes) {
            await execAsync(`docker volume rm ${volume}`);
          }
        } catch (error) {
          console.warn('Error removing volumes:', error);
        }
      }

      console.log(`Real: Removed service ${serviceId} (deleteData: ${deleteData})`);
    } catch (error) {
      throw new Error(`Failed to remove service: ${error}`);
    }
  }

  async getServiceLogs(serviceId: string): Promise<string[]> {
    try {
      const { stdout } = await execAsync(`docker logs --tail 50 ${serviceId}`);
      return stdout.split('\n').filter(line => line.trim());
    } catch (error) {
      throw new Error(`Failed to get service logs: ${error}`);
    }
  }

  async deployService(config: any, envVars?: Record<string, string>): Promise<DockerService> {
    try {
      // Create mixbox network if it doesn't exist
      await this.ensureMixboxNetwork();

      // Generate Docker Compose configuration
      const composeConfig = this.generateComposeConfig(config, envVars);
      
      // Write temporary compose file
      const composeFile = `/tmp/docker-compose-${Date.now()}.yml`;
      await fs.writeFile(composeFile, yaml.dump(composeConfig));

      // Deploy using docker-compose
      await execAsync(`docker-compose -f ${composeFile} up -d`);

      // Clean up temporary file
      await fs.unlink(composeFile);

      // Get the deployed service info
      const services = await this.listServices();
      const deployedService = services.find(s => s.name === config.metadata.name);
      
      if (!deployedService) {
        throw new Error('Deployed service not found');
      }

      return deployedService;
    } catch (error) {
      throw new Error(`Failed to deploy service: ${error}`);
    }
  }

  async checkServiceStatus(serviceId: string): Promise<'running' | 'stopped'> {
    try {
      const { stdout } = await execAsync(`docker inspect --format='{{.State.Status}}' ${serviceId}`);
      return stdout.trim() === 'running' ? 'running' : 'stopped';
    } catch (error) {
      return 'stopped';
    }
  }

  // Helper methods for real Docker operations
  private async ensureMixboxNetwork(): Promise<void> {
    try {
      await execAsync('docker network inspect mixbox');
    } catch (error) {
      // Network doesn't exist, create it
      await execAsync('docker network create mixbox');
    }
  }

  private generateComposeConfig(config: any, envVars?: Record<string, string>): any {
    const serviceName = config.metadata.name;
    const serviceConfig = config.services[serviceName];

    return {
      version: '3.8',
      services: {
        [serviceName]: {
          ...serviceConfig,
          networks: ['mixbox'],
          environment: {
            ...serviceConfig.environment,
            ...envVars,
          },
          labels: {
            'mixbox.managed': 'true',
            'mixbox.name': config.metadata.displayName,
            'mixbox.version': config.metadata.version || 'latest',
            ...serviceConfig.labels,
          },
        },
      },
      networks: {
        mixbox: {
          external: true,
        },
      },
    };
  }

  private async getContainerStats(containerId: string): Promise<{ cpu: number; memory: number }> {
    try {
      const { stdout } = await execAsync(
        `docker stats --no-stream --format "{{.CPUPerc}},{{.MemUsage}}" ${containerId}`
      );
      
      const [cpuStr, memStr] = stdout.trim().split(',');
      const cpu = parseFloat(cpuStr.replace('%', '')) || 0;
      const memory = parseFloat(memStr.split('/')[0].replace('MiB', '').replace('GiB', '')) || 0;
      
      return { cpu, memory };
    } catch (error) {
      return { cpu: 0, memory: 0 };
    }
  }

  private parseStatus(status: string): 'running' | 'stopped' | 'starting' | 'stopping' {
    if (status.includes('Up')) return 'running';
    if (status.includes('Exited')) return 'stopped';
    if (status.includes('Starting')) return 'starting';
    if (status.includes('Stopping')) return 'stopping';
    return 'stopped';
  }

  private parsePorts(ports: string): string[] {
    if (!ports) return [];
    return ports.split(', ').map(p => p.trim()).filter(p => p);
  }

  private extractVersion(image: string): string {
    const parts = image.split(':');
    return parts.length > 1 ? parts[1] : 'latest';
  }

  private formatDisplayName(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
  }

  private calculateUptime(status: string): string {
    const upMatch = status.match(/Up (.+)/);
    return upMatch ? upMatch[1] : '0分钟';
  }
}

// Export singleton instance based on environment
export const dockerOperations: DockerOperations = USE_MOCK 
  ? new MockDockerOperations() 
  : new RealDockerOperations();

// Export for testing or direct access
export { MockDockerOperations, RealDockerOperations };