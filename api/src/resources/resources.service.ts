import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/databases.service';
import { ResourceRecord } from './resources.types.record';

@Injectable()
export class ResourceService {
  private readonly logger = new Logger(ResourceService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  private getDatabase(resourceKind: string) {
    return this.databaseService.getDatabase(resourceKind);
  }

  async listResources(
    namespace: string,
    resourceKind: string,
  ): Promise<ResourceRecord[]> {
    const resp = await this.getDatabase(resourceKind).allDocs({
      startkey: `ns/${namespace}/`,
      endkey: `ns/${namespace}/{}`,
      include_docs: true,
    });

    return resp.rows.map((r) => new ResourceRecord(r.doc!));
  }

  async getResource(
    namespace: string,
    resourceKind: string,
    name: string,
  ): Promise<ResourceRecord> {
    const resp = await this.getDatabase(resourceKind).get(
      ResourceRecord.createID(namespace, name),
    );
    return new ResourceRecord(resp);
  }
}
