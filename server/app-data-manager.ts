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
  port: number;
  icon: string;
  author: string;
  website: string;
  isInstalled: boolean;
  hasUpdate: boolean;
  yaml: string;
}

export interface AppDataManager {
  loadApplications(): Promise<Application[]>;
  getApplication(id: string): Promise<Application | null>;
  getApplicationYaml(id: string): Promise<string | null>;
}

// Local App Data Manager (for development/mock mode)
class LocalAppDataManager implements AppDataManager {
  private applications: Application[] = [];
  private initialized = false;

  constructor() {
    console.log('📁 Using Local App Data Manager');
  }

  private async initialize() {
    if (this.initialized) return;
    
    const appsDir = path.join(process.cwd(), 'apps');
    
    if (!fs.existsSync(appsDir)) {
      console.warn('Apps directory not found, using empty array');
      this.applications = [];
      this.initialized = true;
      return;
    }

    const files = fs.readdirSync(appsDir);
    
    for (const file of files) {
      if (file.endsWith('.yaml') || file.endsWith('.yml')) {
        try {
          const filePath = path.join(appsDir, file);
          const yamlContent = fs.readFileSync(filePath, 'utf8');
          const appData = yaml.load(yamlContent) as any;
          
          if (appData.metadata) {
            this.applications.push({
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
    
    console.log(`Loaded ${this.applications.length} applications from local YAML files:`, 
      this.applications.map(app => ({ id: app.id, name: app.displayName }))
    );
    
    this.initialized = true;
  }

  async loadApplications(): Promise<Application[]> {
    await this.initialize();
    return this.applications;
  }

  async getApplication(id: string): Promise<Application | null> {
    await this.initialize();
    return this.applications.find(app => app.id === id) || null;
  }

  async getApplicationYaml(id: string): Promise<string | null> {
    const app = await this.getApplication(id);
    return app ? app.yaml : null;
  }
}

// Remote App Data Manager (for production mode)
class RemoteAppDataManager implements AppDataManager {
  private githubRepo: string;
  private githubBranch: string;
  private appsPath: string;
  private cache: Map<string, Application> = new Map();
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes
  private lastFetch: number = 0;

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

  private async fetchApplicationFiles(): Promise<string[]> {
    try {
      const contents = await this.fetchGitHubContent(this.appsPath);
      
      if (!Array.isArray(contents)) {
        console.warn('GitHub response is not an array, apps directory might not exist');
        return [];
      }
      
      return contents
        .filter((item: any) => 
          item.type === 'file' && 
          (item.name.endsWith('.yaml') || item.name.endsWith('.yml'))
        )
        .map((item: any) => item.name);
    } catch (error) {
      console.error('Error fetching application file list:', error);
      return [];
    }
  }

  private async fetchApplicationYaml(filename: string): Promise<string | null> {
    try {
      const content = await this.fetchGitHubContent(`${this.appsPath}/${filename}`);
      
      if (content.type !== 'file' || !content.content) {
        console.error(`Invalid content for ${filename}`);
        return null;
      }
      
      // Decode base64 content
      return Buffer.from(content.content, 'base64').toString('utf8');
    } catch (error) {
      console.error(`Error fetching YAML for ${filename}:`, error);
      return null;
    }
  }

  private async refreshCache(): Promise<void> {
    const now = Date.now();
    if (now - this.lastFetch < this.cacheExpiry && this.cache.size > 0) {
      return; // Cache is still valid
    }

    console.log('🔄 Refreshing remote application cache...');
    
    try {
      const filenames = await this.fetchApplicationFiles();
      const newCache = new Map<string, Application>();
      
      for (const filename of filenames) {
        const yamlContent = await this.fetchApplicationYaml(filename);
        if (!yamlContent) continue;
        
        try {
          const appData = yaml.load(yamlContent) as any;
          
          if (appData.metadata) {
            const app: Application = {
              id: appData.metadata.id || filename.replace(/\.(yaml|yml)$/, ''),
              name: appData.metadata.name || filename.replace(/\.(yaml|yml)$/, ''),
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
            };
            
            newCache.set(app.id, app);
          }
        } catch (error) {
          console.error(`Error parsing YAML for ${filename}:`, error);
        }
      }
      
      this.cache = newCache;
      this.lastFetch = now;
      
      console.log(`✅ Loaded ${this.cache.size} applications from remote repository`);
    } catch (error) {
      console.error('Error refreshing application cache:', error);
      // Keep using old cache if refresh fails
    }
  }

  async loadApplications(): Promise<Application[]> {
    await this.refreshCache();
    return Array.from(this.cache.values());
  }

  async getApplication(id: string): Promise<Application | null> {
    await this.refreshCache();
    return this.cache.get(id) || null;
  }

  async getApplicationYaml(id: string): Promise<string | null> {
    const app = await this.getApplication(id);
    return app ? app.yaml : null;
  }
}

// Export singleton instance based on environment
export const appDataManager: AppDataManager = USE_MOCK 
  ? new LocalAppDataManager() 
  : new RemoteAppDataManager();

// Export for testing or direct access
export { LocalAppDataManager, RemoteAppDataManager };