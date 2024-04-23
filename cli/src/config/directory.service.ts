import { mkdir, readFile, writeFile } from 'fs/promises';
import * as os from 'os';
import path from 'path';
import { injectable } from 'tsyringe';

@injectable()
export class DirectoryService {
  constructor() {}

  private getRootDir() {
    return path.join(os.homedir(), '.config', 'optdctl');
  }

  private getConfigFilePath() {
    return path.join(this.getRootDir(), 'config.yaml');
  }

  private async ensureFileExists() {
    await mkdir(this.getRootDir(), { recursive: true });
    return writeFile(this.getConfigFilePath(), '', { flag: 'a' });
  }

  async readConfigFile() {
    await this.ensureFileExists();
    return readFile(this.getConfigFilePath(), { encoding: 'utf8' });
  }

  async writeConfigFile(data: string) {
    await this.ensureFileExists();
    return writeFile(this.getConfigFilePath(), data, { encoding: 'utf8' });
  }
}
