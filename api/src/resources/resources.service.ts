import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/databases.service';
import {
  CreateResourceRecord,
  ResourceRecord,
  UpdateResourceRecord,
} from './resources.types.record';
import { History } from 'src/types/types';
import { isPouchDBError } from 'src/utils.types';

@Injectable()
export class ResourceService {
  private readonly logger = new Logger(ResourceService.name);

  constructor(private readonly dbService: DatabaseService) {}

  private getDatabase(resourceKind: string) {
    return this.dbService.getDatabase(resourceKind);
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

  async updateResource(
    record: UpdateResourceRecord,
    resourceKind: string,
    username: string,
    message: string,
  ): Promise<ResourceRecord> {
    const existing = await this.getDatabase(resourceKind).get(record._id);
    const { _rev, ...restExisting } = existing;

    const name = ResourceRecord.splitID(record._id).name;

    const history = {
      ...restExisting,
      _id: History.createID(name, _rev, resourceKind),
    };

    let historyRev: string | undefined;

    try {
      const res = await this.getDatabase(resourceKind).put(history);
      historyRev = res.rev;
      const histID = res.id;

      const newDocument = {
        ...record,
        history: new History({
          by: username,
          at: new Date().toISOString(),
          message,
          parent: histID,
        }),
      };

      const documentResult =
        await this.getDatabase(resourceKind).put(newDocument);
      return await this.getDatabase(resourceKind).get(documentResult.id);
    } catch (e) {
      if (isPouchDBError(e)) {
        if (historyRev && e.docId !== history._id) {
          this.logger.debug(
            'reverting history document after creation failure',
          );
          this.getDatabase(resourceKind).remove({
            _id: history._id,
            _rev: historyRev,
          });

          throw e;
        }
      }
      this.logger.error('unhandled error', e);
      throw e;
    }
  }

  async createResource(
    record: CreateResourceRecord,
    resourceKind: string,
    username: string,
    message: string,
  ): Promise<ResourceRecord> {
    const newRecord = {
      ...record,
      history: new History({
        by: username,
        at: new Date().toISOString(),
        message,
        parent: null,
      }),
    };

    const result = await this.getDatabase(resourceKind).put(newRecord);
    return this.dbService.metaDB.get(result.id);
  }
}
