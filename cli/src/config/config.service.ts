import { injectable } from 'tsyringe';
import { DirectoryService } from './directory.service';
import { parse, stringify } from 'yaml';

export interface ServerConfig {
  url: string;
  auth: {
    access_token: string;
  };
}

export interface Config {
  servers: Record<string, ServerConfig>;
  current: string | undefined;
}

@injectable()
export class ConfigService {
  private configCache: Config | undefined;

  constructor(private readonly directoryService: DirectoryService) {}

  private async getConfigObj(): Promise<Config> {
    if (this.configCache) {
      return this.configCache;
    }

    const configStr = await this.directoryService.readConfigFile();
    this.configCache = parse(configStr) ?? { servers: {}, current: undefined };
    return this.configCache!;
  }

  async getServer(name: string): Promise<ServerConfig | undefined> {
    const config = await this.getConfigObj();
    return config.servers[name];
  }

  async getCurrentServer(): Promise<ServerConfig | undefined> {
    const config = await this.getConfigObj();
    if (!config.current) {
      return undefined;
    }
    return config.servers[config.current];
  }

  async writeServerConfig(
    name: string,
    serverURL: string,
    accessToken: string,
  ) {
    const config = await this.getConfigObj();
    config.servers[name] = {
      url: serverURL,
      auth: { access_token: accessToken },
    };
    await this.directoryService.writeConfigFile(stringify(config));
    this.configCache = undefined;
  }

  async setCurrentServer(name: string) {
    const config = await this.getConfigObj();
    if (!config.servers[name]) {
      throw new Error('No such server');
    }
    config.current = name;
    await this.directoryService.writeConfigFile(stringify(config));
    this.configCache = undefined;
  }
}
