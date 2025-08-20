import {
  users,
  services,
  applications,
  settings,
  type User,
  type UpsertUser,
  type Service,
  type InsertService,
  type Application,
  type InsertApplication,
  type Settings,
  type InsertSettings,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Service operations
  getServices(userId: string): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, updates: Partial<InsertService>): Promise<Service>;
  deleteService(id: string): Promise<void>;
  
  // Application operations
  getApplications(): Promise<Application[]>;
  getApplication(id: string): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: string, updates: Partial<InsertApplication>): Promise<Application>;
  
  // Settings operations
  getSettings(userId: string): Promise<Settings | undefined>;
  upsertSettings(settings: InsertSettings): Promise<Settings>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Service operations
  async getServices(userId: string): Promise<Service[]> {
    return await db
      .select()
      .from(services)
      .where(eq(services.userId, userId))
      .orderBy(desc(services.createdAt));
  }

  async getService(id: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  async updateService(id: string, updates: Partial<InsertService>): Promise<Service> {
    const [updatedService] = await db
      .update(services)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(services.id, id))
      .returning();
    return updatedService;
  }

  async deleteService(id: string): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }

  // Application operations
  async getApplications(): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .orderBy(desc(applications.createdAt));
  }

  async getApplication(id: string): Promise<Application | undefined> {
    const [app] = await db.select().from(applications).where(eq(applications.id, id));
    return app;
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const [newApp] = await db.insert(applications).values(application).returning();
    return newApp;
  }

  async updateApplication(id: string, updates: Partial<InsertApplication>): Promise<Application> {
    const [updatedApp] = await db
      .update(applications)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    return updatedApp;
  }

  // Settings operations
  async getSettings(userId: string): Promise<Settings | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.userId, userId));
    return setting;
  }

  async upsertSettings(settingsData: InsertSettings): Promise<Settings> {
    const [setting] = await db
      .insert(settings)
      .values(settingsData)
      .onConflictDoUpdate({
        target: settings.userId,
        set: {
          ...settingsData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return setting;
  }
}

export const storage = new DatabaseStorage();
