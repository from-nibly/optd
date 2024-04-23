import wretch from 'wretch';
import { ConfigService } from './config/config.service';
import { injectable } from 'tsyringe';

@injectable()
export class ClientService {
  constructor(private readonly configService: ConfigService) {}

  async getClient() {
    const server = await this.configService.getCurrentServer();
    if (!server) {
      throw new Error('No current server');
    }
    return wretch(server.url).auth(`Bearer ${server.auth.access_token}`);
  }
}
