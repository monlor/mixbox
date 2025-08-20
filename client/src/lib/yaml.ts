import yaml from 'js-yaml';

export interface ServiceConfig {
  image: string;
  port?: number;
  env?: Record<string, string>;
  volumes?: string[];
  dependencies?: string[];
}

export interface YamlServiceSpec {
  metadata: {
    displayName: string;
    description: string;
    category: string;
    version: string;
    icon?: string;
    stars?: string;
  };
  spec: ServiceConfig;
}

export function parseYamlConfig(yamlContent: string): YamlServiceSpec {
  try {
    const parsed = yaml.load(yamlContent) as YamlServiceSpec;
    if (!parsed.metadata || !parsed.spec) {
      throw new Error('Invalid YAML structure: missing metadata or spec');
    }
    return parsed;
  } catch (error) {
    throw new Error(`Failed to parse YAML: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function generateDockerCompose(config: ServiceConfig, serviceName: string): string {
  const compose = {
    version: '3.8',
    services: {
      [serviceName]: {
        image: config.image,
        container_name: `mixbox_${serviceName}`,
        ...(config.port && { ports: [`${config.port}:${config.port}`] }),
        ...(config.env && Object.keys(config.env).length > 0 && { environment: config.env }),
        ...(config.volumes && config.volumes.length > 0 && { volumes: config.volumes }),
        networks: ['mixbox_network'],
        restart: 'unless-stopped',
        labels: [
          'traefik.enable=true',
          `traefik.http.routers.${serviceName}.rule=Host(\`${serviceName}.mixbox.com\`)`,
          `traefik.http.services.${serviceName}.loadbalancer.server.port=${config.port || 80}`,
        ],
      },
    },
    networks: {
      mixbox_network: {
        external: true,
      },
    },
  };

  // Add named volumes if any volumes are defined
  if (config.volumes && config.volumes.length > 0) {
    const namedVolumes: Record<string, any> = {};
    config.volumes.forEach(volume => {
      const [host] = volume.split(':');
      if (!host.startsWith('/') && !host.startsWith('./')) {
        namedVolumes[host] = { driver: 'local' };
      }
    });
    
    if (Object.keys(namedVolumes).length > 0) {
      compose.volumes = namedVolumes;
    }
  }

  return yaml.dump(compose, { indent: 2 });
}

export function validateYamlConfig(config: YamlServiceSpec): string[] {
  const errors: string[] = [];

  if (!config.metadata.displayName) {
    errors.push('Missing displayName in metadata');
  }
  
  if (!config.metadata.description) {
    errors.push('Missing description in metadata');
  }
  
  if (!config.metadata.category) {
    errors.push('Missing category in metadata');
  }
  
  if (!config.spec.image) {
    errors.push('Missing image in spec');
  }

  return errors;
}
