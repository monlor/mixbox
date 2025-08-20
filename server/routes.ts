import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertServiceSchema, insertApplicationSchema, insertSettingsSchema } from "@shared/schema";
import yaml from "js-yaml";
import { mockApplications, mockDockerService } from './mock-data';

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Service routes
  app.get('/api/services', isAuthenticated, async (req: any, res) => {
    try {
      // In development mode, use mock Docker service
      const services = await mockDockerService.getServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get('/api/services/:id', isAuthenticated, async (req: any, res) => {
    try {
      const services = await mockDockerService.getServices();
      const service = services.find(s => s.id === req.params.id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      console.error("Error fetching service:", error);
      res.status(500).json({ message: "Failed to fetch service" });
    }
  });

  app.post('/api/services', isAuthenticated, async (req: any, res) => {
    try {
      const serviceData = req.body;
      const service = await mockDockerService.createService(serviceData);
      res.json(service);
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(400).json({ message: "Failed to create service" });
    }
  });

  app.put('/api/services/:id', isAuthenticated, async (req: any, res) => {
    try {
      const updates = insertServiceSchema.partial().parse(req.body);
      const service = await storage.updateService(req.params.id, updates);
      res.json(service);
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(400).json({ message: "Failed to update service" });
    }
  });

  app.delete('/api/services/:id', isAuthenticated, async (req: any, res) => {
    try {
      await mockDockerService.removeService(req.params.id);
      res.json({ message: "Service deleted successfully" });
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // Service control routes
  app.post('/api/services/:id/start', isAuthenticated, async (req: any, res) => {
    try {
      await mockDockerService.startService(req.params.id);
      res.json({ message: "Service started successfully" });
    } catch (error) {
      console.error("Error starting service:", error);
      res.status(500).json({ message: "Failed to start service" });
    }
  });

  app.post('/api/services/:id/stop', isAuthenticated, async (req: any, res) => {
    try {
      await mockDockerService.stopService(req.params.id);
      res.json({ message: "Service stopped successfully" });
    } catch (error) {
      console.error("Error stopping service:", error);
      res.status(500).json({ message: "Failed to stop service" });
    }
  });

  app.get('/api/services/:id/logs', isAuthenticated, async (req: any, res) => {
    try {
      const logs = await mockDockerService.getServiceLogs(req.params.id);
      res.json({ logs });
    } catch (error) {
      console.error("Error fetching service logs:", error);
      res.status(500).json({ message: "Failed to fetch service logs" });
    }
  });

  app.get('/api/services/:id/stats', isAuthenticated, async (req: any, res) => {
    try {
      const stats = await mockDockerService.getServiceStats(req.params.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching service stats:", error);
      res.status(500).json({ message: "Failed to fetch service stats" });
    }
  });

  // Application/Marketplace routes
  app.get('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      // Get installed services to check status and version
      const installedServices = await mockDockerService.getServices();
      const applicationsWithStatus = mockApplications.map(app => {
        const installedService = installedServices.find(service => service.name === app.name);
        const isInstalled = !!installedService;
        
        // Check if there's a version update available
        let hasUpdate = false;
        if (isInstalled && installedService.version && app.version) {
          // Compare versions - if installed version is different from app version, there might be an update
          hasUpdate = installedService.version !== app.version;
        }
        
        return {
          ...app,
          isInstalled,
          hasUpdate,
          installedVersion: installedService?.version
        };
      });
      
      console.log('Application status check:', applicationsWithStatus.map(app => ({
        name: app.name,
        isInstalled: app.isInstalled,
        hasUpdate: app.hasUpdate,
        appVersion: app.version,
        installedVersion: app.installedVersion
      })));
      
      res.json(applicationsWithStatus);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post('/api/applications/sync', isAuthenticated, async (req: any, res) => {
    try {
      if (process.env.NODE_ENV === 'production') {
        // In production, fetch from GitHub repository
        const githubUrl = 'https://api.github.com/repos/your-username/mixbox/contents/apps';
        const response = await fetch(githubUrl);
        
        if (!response.ok) {
          throw new Error('Failed to fetch from GitHub');
        }

        const files = await response.json();
        const applications = [];

        for (const file of files) {
          if (file.name.endsWith('.yaml') || file.name.endsWith('.yml')) {
            try {
              const yamlResponse = await fetch(file.download_url);
              const yamlContent = await yamlResponse.text();
              const appData = yaml.load(yamlContent) as any;

              if (appData.metadata) {
                applications.push({
                  id: appData.metadata.id,
                  name: appData.metadata.name,
                  displayName: appData.metadata.displayName,
                  description: appData.metadata.description,
                  category: appData.metadata.category,
                  version: appData.metadata.version,
                  stars: appData.metadata.stars,
                  port: appData.metadata.mainPort,
                  icon: appData.metadata.icon,
                  author: appData.metadata.author,
                  website: appData.metadata.website,
                  isInstalled: false,
                  hasUpdate: false,
                  yaml: yamlContent
                });
              }
            } catch (error) {
              console.error(`Error processing ${file.name}:`, error);
            }
          }
        }
        res.json(applications);
      } else {
        // In development mode, use local files
        await new Promise(resolve => setTimeout(resolve, 500));
        res.json(mockApplications);
      }
    } catch (error) {
      console.error("Error syncing applications:", error);
      res.status(500).json({ message: "Failed to sync applications" });
    }
  });

  app.get('/api/applications/:id/yaml', async (req, res) => {
    try {
      const application = mockApplications.find(app => app.id === req.params.id);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      res.json({ yamlContent: application.yaml });
    } catch (error) {
      console.error("Error fetching application YAML:", error);
      res.status(500).json({ message: "Failed to fetch application YAML" });
    }
  });

  app.post('/api/applications/:id/install', isAuthenticated, async (req: any, res) => {
    try {
      const applicationId = req.params.id;
      const { customEnvVars, serviceName, domain } = req.body;
      const application = mockApplications.find(app => app.id === applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Parse YAML and merge custom environment variables
      let yamlContent = application.yaml;
      if (customEnvVars && Object.keys(customEnvVars).length > 0) {
        try {
          const yamlData = yaml.load(application.yaml) as any;
          
          // Update environment variables for all services
          if (yamlData.services) {
            Object.keys(yamlData.services).forEach(serviceName => {
              if (yamlData.services[serviceName].environment) {
                // Merge with custom env vars
                yamlData.services[serviceName].environment = {
                  ...yamlData.services[serviceName].environment,
                  ...customEnvVars
                };
              } else {
                yamlData.services[serviceName].environment = customEnvVars;
              }
            });
          }
          
          // Ensure all services use mixbox network
          if (yamlData.services) {
            Object.keys(yamlData.services).forEach(serviceName => {
              yamlData.services[serviceName].networks = ['mixbox'];
            });
          }
          
          // Add external mixbox network
          yamlData.networks = {
            ...(yamlData.networks || {}),
            mixbox: { external: true }
          };
          
          yamlContent = yaml.dump(yamlData);
        } catch (error) {
          console.error('Error processing YAML:', error);
        }
      }

      const finalServiceName = serviceName || application.name;
      
      // Create service from application with updated configuration
      const serviceConfig = {
        name: finalServiceName,
        displayName: application.displayName,
        description: application.description,
        port: application.port,
        domain: domain || `${finalServiceName}.mixbox.com`,
        version: application.version,
        yaml: yamlContent,
        customEnvVars
      };

      const service = await mockDockerService.createService(serviceConfig);
      res.json(service);
    } catch (error) {
      console.error("Error installing application:", error);
      res.status(500).json({ message: "Failed to install application" });
    }
  });

  // Service management routes
  app.post('/api/services/:id/start', isAuthenticated, async (req: any, res) => {
    try {
      await mockDockerService.startService(req.params.id);
      res.json({ message: "Service started successfully" });
    } catch (error) {
      console.error("Error starting service:", error);
      res.status(500).json({ message: "Failed to start service" });
    }
  });

  app.post('/api/services/:id/stop', isAuthenticated, async (req: any, res) => {
    try {
      await mockDockerService.stopService(req.params.id);
      res.json({ message: "Service stopped successfully" });
    } catch (error) {
      console.error("Error stopping service:", error);
      res.status(500).json({ message: "Failed to stop service" });
    }
  });

  app.delete('/api/services/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { deleteData } = req.body;
      await mockDockerService.removeService(req.params.id, deleteData);
      res.json({ 
        message: "Service removed successfully",
        dataDeleted: deleteData 
      });
    } catch (error) {
      console.error("Error removing service:", error);
      res.status(500).json({ message: "Failed to remove service" });
    }
  });

  app.get('/api/services/:id/logs', isAuthenticated, async (req: any, res) => {
    try {
      const logs = await mockDockerService.getServiceLogs(req.params.id);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching service logs:", error);
      res.status(500).json({ message: "Failed to fetch service logs" });
    }
  });

  // Settings routes
  app.get('/api/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let settings = await storage.getSettings(userId);
      
      if (!settings) {
        // Create default settings
        settings = await storage.upsertSettings({
          dockerSocket: "/var/run/docker.sock",
          defaultDomain: "mixbox.com",
          sslEnabled: true,
          githubRepo: "https://github.com/monlor/mixbox",
          updateFrequency: "daily",
          userId,
        });
      }
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put('/api/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settingsData = insertSettingsSchema.parse({ ...req.body, userId });
      const settings = await storage.upsertSettings(settingsData);
      res.json(settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(400).json({ message: "Failed to update settings" });
    }
  });

  // Docker Compose generation endpoint
  app.post('/api/generate-compose', isAuthenticated, async (req, res) => {
    try {
      const { yamlContent, serviceName, config } = req.body;
      const yamlData = yaml.load(yamlContent) as any;
      const dockerCompose = generateDockerCompose(yamlData, serviceName, config);
      res.json({ dockerCompose });
    } catch (error) {
      console.error("Error generating docker compose:", error);
      res.status(500).json({ message: "Failed to generate docker compose" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function generateDockerCompose(yamlData: any, serviceName: string, customConfig?: any): string {
  const config = customConfig || yamlData.spec || {};
  
  const compose = {
    version: '3.8',
    services: {
      [serviceName]: {
        image: config.image || 'nginx:latest',
        container_name: `mixbox_${serviceName}`,
        ports: config.port ? [`${config.port}:${config.port}`] : [],
        environment: config.env || {},
        volumes: config.volumes || [],
        networks: ['mixbox_network'],
        restart: 'unless-stopped',
        labels: [
          'traefik.enable=true',
          `traefik.http.routers.${serviceName}.rule=Host(\`${serviceName}.mixbox.com\`)`,
          `traefik.http.services.${serviceName}.loadbalancer.server.port=${config.port || 80}`,
        ],
      },
    },
    volumes: config.namedVolumes || {},
    networks: {
      mixbox_network: {
        external: true,
      },
    },
  };

  return yaml.dump(compose, { indent: 2 });
}
