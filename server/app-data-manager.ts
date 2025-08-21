import * as fs from 'fs';
import * as path from 'path';
import yaml from 'js-yaml';

// Environment variable to control data source mode (default: true for development)
const USE_MOCK = process.env.USE_MOCK !== 'false';

console.log(`📦 App Data Mode: ${USE_MOCK ? 'LOCAL' : 'REMOTE'} (USE_MOCK=${process.env.USE_MOCK || 'undefined'})`);

export interface Application {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  version: string;
  stars: number;
  mainPort: number;
  icon: string;
  author: string;
  website: string;
  tags: string[];
  configFile: string;
  isInstalled?: boolean;
  hasUpdate?: boolean;
}

export interface ApplicationCatalog {
  metadata: {
    name: string;
    version: string;
    description: string;
    lastUpdate: string;
  };
  categories: {
    id: string;
    name: string;
    description: string;
  }[];
  applications: Application[];
}

export interface AppDataManager {
  loadCatalog(): Promise<ApplicationCatalog>;
  loadApplications(): Promise<Application[]>;
  getApplication(id: string): Promise<Application | null>;
  getApplicationYaml(id: string): Promise<string | null>;
}

// Local App Data Manager (for development/mock mode)
class LocalAppDataManager implements AppDataManager {
  private catalog: ApplicationCatalog | null = null;
  private yamlCache: Map<string, string> = new Map();

  constructor() {
    console.log('📁 Using Local App Data Manager');
  }

  async loadCatalog(): Promise<ApplicationCatalog> {
    if (this.catalog) return this.catalog;

    const catalogPath = path.join(process.cwd(), 'apps', 'catalog.yaml');
    
    if (!fs.existsSync(catalogPath)) {
      throw new Error('catalog.yaml not found in apps directory');
    }

    try {
      const catalogContent = fs.readFileSync(catalogPath, 'utf8');
      this.catalog = yaml.load(catalogContent) as ApplicationCatalog;
      
      console.log(`Loaded catalog with ${this.catalog.applications.length} applications:`, 
        this.catalog.applications.map(app => ({ id: app.id, name: app.displayName }))
      );
      
      return this.catalog;
    } catch (error) {
      console.error('Error loading catalog.yaml:', error);
      throw error;
    }
  }

  async loadApplications(): Promise<Application[]> {
    const catalog = await this.loadCatalog();
    return catalog.applications;
  }

  async getApplication(id: string): Promise<Application | null> {
    const catalog = await this.loadCatalog();
    return catalog.applications.find(app => app.id === id) || null;
  }

  async getApplicationYaml(id: string): Promise<string | null> {
    // Check cache first
    if (this.yamlCache.has(id)) {
      return this.yamlCache.get(id)!;
    }

    const app = await this.getApplication(id);
    if (!app) return null;

    const yamlPath = path.join(process.cwd(), 'apps', app.configFile);
    
    if (!fs.existsSync(yamlPath)) {
      console.error(`Config file ${app.configFile} not found for application ${id}`);
      return null;
    }

    try {
      const yamlContent = fs.readFileSync(yamlPath, 'utf8');
      this.yamlCache.set(id, yamlContent);
      return yamlContent;
    } catch (error) {
      console.error(`Error loading YAML for ${id}:`, error);
      return null;
    }
  }
}

// Remote App Data Manager (for production mode)
class RemoteAppDataManager implements AppDataManager {
  private githubRepo: string;
  private githubBranch: string;
  private appsPath: string;
  private catalogCache: ApplicationCatalog | null = null;
  private yamlCache: Map<string, string> = new Map();
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes
  private lastCatalogFetch: number = 0;

  constructor() {
    console.log('🌐 Using Remote App Data Manager');
    
    // Default to the current repository or allow override via environment
    this.githubRepo = process.env.GITHUB_REPO || 'monlor/mixbox';
    this.githubBranch = process.env.GITHUB_BRANCH || 'main';
    this.appsPath = process.env.APPS_PATH || 'apps';
    
    console.log(`GitHub Source: ${this.githubRepo}/${this.githubBranch}/${this.appsPath}`);
  }

  private async fetchGitHubContent(path: string): Promise<any> {
    const url = `https://api.github.com/repos/${this.githubRepo}/contents/${path}?ref=${this.githubBranch}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'MixBox-App'
        }
      });
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching from GitHub: ${url}`, error);
      throw error;
    }
  }

  async loadCatalog(): Promise<ApplicationCatalog> {
    const now = Date.now();
    if (this.catalogCache && (now - this.lastCatalogFetch < this.cacheExpiry)) {
      return this.catalogCache;
    }

    console.log('🔄 Fetching remote catalog...');
    
    try {
      const catalogContent = await this.fetchGitHubContent(`${this.appsPath}/catalog.yaml`);
      
      if (catalogContent.type !== 'file' || !catalogContent.content) {
        throw new Error('Invalid catalog.yaml content from GitHub');
      }
      
      const yamlContent = Buffer.from(catalogContent.content, 'base64').toString('utf8');
      this.catalogCache = yaml.load(yamlContent) as ApplicationCatalog;
      this.lastCatalogFetch = now;
      
      console.log(`✅ Loaded catalog with ${this.catalogCache.applications.length} applications`);
      return this.catalogCache;
    } catch (error) {
      console.error('Error fetching remote catalog:', error);
      if (this.catalogCache) {
        console.log('Using cached catalog due to fetch error');
        return this.catalogCache;
      }
      throw error;
    }
  }

  async loadApplications(): Promise<Application[]> {
    const catalog = await this.loadCatalog();
    return catalog.applications;
  }

  async getApplication(id: string): Promise<Application | null> {
    const catalog = await this.loadCatalog();
    return catalog.applications.find(app => app.id === id) || null;
  }

  async getApplicationYaml(id: string): Promise<string | null> {
    // Check cache first
    if (this.yamlCache.has(id)) {
      return this.yamlCache.get(id)!;
    }

    const app = await this.getApplication(id);
    if (!app) return null;

    try {
      const content = await this.fetchGitHubContent(`${this.appsPath}/${app.configFile}`);
      
      if (content.type !== 'file' || !content.content) {
        console.error(`Invalid config file content for ${app.configFile}`);
        return null;
      }
      
      const yamlContent = Buffer.from(content.content, 'base64').toString('utf8');
      this.yamlCache.set(id, yamlContent);
      return yamlContent;
    } catch (error) {
      console.error(`Error fetching YAML for ${id}:`, error);
      return null;
    }
  }
}

// Export singleton instance based on environment
export const appDataManager: AppDataManager = USE_MOCK 
  ? new LocalAppDataManager() 
  : new RemoteAppDataManager();

// Export for testing or direct access
export { LocalAppDataManager, RemoteAppDataManager };