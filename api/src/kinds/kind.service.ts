import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { KindRecord } from './kind.types';

@Injectable()
export class KindService {
  constructor(private readonly dbService: DatabaseService) {}

  async listKinds(): Promise<KindRecord[]> {
    const resp = await this.dbService.metaDB.allDocs<KindRecord>({
      startkey: '',
      include_docs: true,
    });
    return resp.rows.map((r) => r.doc!);
  }
}
