import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertServiceSchema, insertApplicationSchema, insertSettingsSchema } from "@shared/schema";
import yaml from "js-yaml";

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
      const userId = req.user.claims.sub;
      const services = await storage.getServices(userId);
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get('/api/services/:id', isAuthenticated, async (req: any, res) => {
    try {
      const service = await storage.getService(req.params.id);
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
      const userId = req.user.claims.sub;
      const serviceData = insertServiceSchema.parse({ ...req.body, userId });
      const service = await storage.createService(serviceData);
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
      await storage.deleteService(req.params.id);
      res.json({ message: "Service deleted successfully" });
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // Application/Marketplace routes
  app.get('/api/applications', async (req, res) => {
    try {
      const applications = await storage.getApplications();
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post('/api/applications/sync', isAuthenticated, async (req: any, res) => {
    try {
      // Fetch applications from GitHub repository
      const githubUrl = 'https://api.github.com/repos/monlor/mixbox/contents/apps';
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
            const yamlData = yaml.load(yamlContent) as any;

            const app = await storage.createApplication({
              name: file.name.replace(/\.(yaml|yml)$/, ''),
              displayName: yamlData.metadata?.displayName || file.name,
              description: yamlData.metadata?.description || '',
              category: yamlData.metadata?.category || 'other',
              version: yamlData.metadata?.version || 'latest',
              icon: yamlData.metadata?.icon || '',
              stars: yamlData.metadata?.stars || '0',
              githubUrl: file.html_url,
              yamlUrl: file.download_url,
              yamlContent: yamlContent,
            });
            applications.push(app);
          } catch (error) {
            console.error(`Error processing ${file.name}:`, error);
          }
        }
      }

      res.json(applications);
    } catch (error) {
      console.error("Error syncing applications:", error);
      res.status(500).json({ message: "Failed to sync applications" });
    }
  });

  app.post('/api/applications/:id/install', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const application = await storage.getApplication(req.params.id);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Parse YAML and create service
      const yamlData = yaml.load(application.yamlContent || '') as any;
      const { serviceName, domain } = req.body;

      const service = await storage.createService({
        name: serviceName || application.name,
        displayName: application.displayName,
        description: application.description,
        image: yamlData.spec?.image || '',
        status: 'stopped',
        port: yamlData.spec?.port || 80,
        domain: domain || `${serviceName || application.name}.mixbox.com`,
        config: yamlData.spec?.env || {},
        yamlConfig: application.yamlContent,
        dockerCompose: generateDockerCompose(yamlData, serviceName || application.name),
        userId,
      });

      res.json(service);
    } catch (error) {
      console.error("Error installing application:", error);
      res.status(500).json({ message: "Failed to install application" });
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
