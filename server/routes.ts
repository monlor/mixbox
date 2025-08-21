import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertServiceSchema, insertApplicationSchema, insertSettingsSchema } from "@shared/schema";
import yaml from "js-yaml";
import { mockApplications, loadApplicationsFromYAML } from './mock-data';
import { dockerOperations } from "./docker-operations";

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
      const services = await dockerOperations.listServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get('/api/services/:id', isAuthenticated, async (req: any, res) => {
    try {
      const services = await dockerOperations.listServices();
      const service = services.find((s: any) => s.id === req.params.id);
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
      const service = await dockerOperations.deployService(serviceData);
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
      const { deleteData } = req.body;
      await dockerOperations.removeService(req.params.id, deleteData);
      res.json({ 
        message: "Service removed successfully",
        dataDeleted: deleteData 
      });
    } catch (error) {
      console.error("Error removing service:", error);
      res.status(500).json({ message: "Failed to remove service" });
    }
  });

  // Service control routes
  app.post('/api/services/:id/start', isAuthenticated, async (req: any, res) => {
    try {
      await dockerOperations.startService(req.params.id);
      res.json({ message: "Service started successfully" });
    } catch (error) {
      console.error("Error starting service:", error);
      res.status(500).json({ message: "Failed to start service" });
    }
  });

  app.post('/api/services/:id/stop', isAuthenticated, async (req: any, res) => {
    try {
      await dockerOperations.stopService(req.params.id);
      res.json({ message: "Service stopped successfully" });
    } catch (error) {
      console.error("Error stopping service:", error);
      res.status(500).json({ message: "Failed to stop service" });
    }
  });

  app.get('/api/services/:id/logs', isAuthenticated, async (req: any, res) => {
    try {
      const logs = await dockerOperations.getServiceLogs(req.params.id);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching service logs:", error);
      res.status(500).json({ message: "Failed to fetch service logs" });
    }
  });

  // Applications/Marketplace routes
  app.get('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const applications = await loadApplicationsFromYAML();
      
      // Add installation status to each application
      const services = await dockerOperations.listServices();
      const applicationsWithStatus = applications.map((app: any) => {
        const installedService = services.find((service: any) => service.name === app.name);
        return {
          ...app,
          isInstalled: !!installedService,
          hasUpdate: installedService ? 
            app.metadata?.version !== installedService.version : false,
          appVersion: app.metadata?.version,
          installedVersion: installedService?.version
        };
      });
      
      console.log('Application status check:', applicationsWithStatus.map((app: any) => ({
        name: app.name,
        isInstalled: app.isInstalled,
        hasUpdate: app.hasUpdate,
        appVersion: app.appVersion,
        installedVersion: app.installedVersion
      })));
      
      res.json(applicationsWithStatus);
    } catch (error) {
      console.error("Error loading applications:", error);
      res.status(500).json({ message: "Failed to load applications" });
    }
  });

  app.get('/api/applications/:id', isAuthenticated, async (req: any, res) => {
    try {
      const applications = await loadApplicationsFromYAML();
      const application = applications.find((app: any) => app.id === req.params.id);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      res.json(application);
    } catch (error) {
      console.error("Error fetching application:", error);
      res.status(500).json({ message: "Failed to fetch application" });
    }
  });

  app.get('/api/applications/:id/yaml', isAuthenticated, async (req: any, res) => {
    try {
      const applications = await loadApplicationsFromYAML();
      const application = applications.find((app: any) => app.id === req.params.id);
      
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
      const applications = await loadApplicationsFromYAML();
      const application = applications.find((app: any) => app.id === applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Parse YAML and merge custom environment variables
      let config = yaml.load(application.yaml) as any;
      if (customEnvVars && Object.keys(customEnvVars).length > 0) {
        try {
          // Update environment variables for all services
          if (config.services) {
            Object.keys(config.services).forEach(serviceName => {
              if (config.services[serviceName].environment) {
                // Merge with custom env vars
                config.services[serviceName].environment = {
                  ...config.services[serviceName].environment,
                  ...customEnvVars
                };
              } else {
                config.services[serviceName].environment = customEnvVars;
              }
            });
          }
        } catch (error) {
          console.error('Error processing YAML:', error);
        }
      }

      // Deploy service using docker operations
      const service = await dockerOperations.deployService(config, customEnvVars);
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
      const updates = insertSettingsSchema.omit({ userId: true }).parse(req.body);
      const settings = await storage.upsertSettings({ ...updates, userId });
      res.json(settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(400).json({ message: "Failed to update settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}