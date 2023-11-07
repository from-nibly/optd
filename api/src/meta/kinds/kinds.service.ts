import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/databases.service';
import {
  CreateKindRecord,
  KindRecord,
  UpdateKindRecord,
} from './kinds.types.record';
import { History } from 'src/types/types';
import { isPouchDBError } from 'src/utils.types';

@Injectable()
export class KindService {
  private readonly logger = new Logger(KindService.name);

  constructor(private readonly dbService: DatabaseService) {}

  async listKinds(): Promise<KindRecord[]> {
    const resp = await this.dbService.metaDB.allDocs({
      startkey: 'kind/',
      endkey: 'kind/{}',
      include_docs: true,
    });
    return resp.rows.map((r) => new KindRecord(r.doc!));
  }

  async getKind(name: string): Promise<KindRecord> {
    return await this.dbService.metaDB.get(KindRecord.createID(name));
  }

  async updateKind(
    kind: UpdateKindRecord,
    user: string,
    message: string,
  ): Promise<KindRecord> {
    //history etc
    const existing = await this.dbService.metaDB.get(kind._id);
    const { _rev, ...restExisting } = existing;

    const name = KindRecord.splitID(kind._id).name;

    const history = {
      ...restExisting,
      _id: History.createID(name, _rev, 'kind'),
    };

    let historyRev: string | undefined;

    try {
      const res = await this.dbService.metaDB.put(history);
      historyRev = res.rev;
      const histID = res.id;

      const newDocument = {
        ...kind,
        history: new History({
          by: user,
          at: new Date().toISOString(),
          message,
          parent: histID,
        }),
      };

      const documentResult = await this.dbService.metaDB.put(newDocument);
      return await this.dbService.metaDB.get(documentResult.id);
    } catch (e) {
      if (isPouchDBError(e)) {
        if (historyRev && e.docId !== history._id) {
          this.logger.debug(
            'reverting history document after creation failure',
          );
          this.dbService.metaDB.remove({ _id: history._id, _rev: historyRev });
          throw e;
        }
      }
      this.logger.error('unhandled error', e);
      throw e;
    }
  }

  async createKind(
    kind: CreateKindRecord,
    user: string,
    message: string,
  ): Promise<KindRecord> {
    this.logger.debug('creating kind record');
    const newRecord = {
      ...kind,
      history: new History({
        by: user,
        at: new Date().toISOString(),
        message,
        parent: null,
      }),
      status: {},
    };
    const result = await this.dbService.metaDB.put(newRecord);
    return this.dbService.metaDB.get(result.id);
  }
}
