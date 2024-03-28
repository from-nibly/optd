import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/databases.service';
import {
  KindDBRecord,
  fromCreateRecord,
  fromUpdateRecord,
} from './kinds.types.record';
import { CreateKind, Kind, UpdateKind } from './kinds.types';
import { UserContext } from 'src/types/types';

@Injectable()
export class KindService {
  private readonly logger = new Logger(KindService.name);

  constructor(private readonly dbService: DatabaseService) {}

  async listKinds(): Promise<Kind[]> {
    const resp = await this.dbService
      .client('meta_kind')
      .select<KindDBRecord[]>('*');
    const results = resp.map((r) => Kind.fromDBRecord(r));
    return results;
  }

  async getKind(name: string): Promise<Kind> {
    const resp = await this.dbService
      .client('meta_kind')
      .select<KindDBRecord[]>('*')
      .where('name', name);
    //error handling
    if (resp.length === 0) {
      throw new NotFoundException(`Kind with name ${name} not found`);
    }
    if (resp.length > 1) {
      this.logger.error(`found multiple kinds with name ${name}, using first`);
      throw new Error('multiple kinds with same name');
    }
    return Kind.fromDBRecord(resp[0]);
  }

  async updateKind(
    kind: UpdateKind,
    user: string,
    message: string,
  ): Promise<Kind> {
    //history etc
    return this.dbService.client.transaction(async (trx) => {
      const [existing, ...extra] = await trx('meta_kind')
        .select<KindDBRecord[]>('*')
        .where('name', kind.metadata.name);

      if (extra.length > 0) {
        this.logger.error(
          `found multiple kinds with name ${kind.metadata.name}`,
        );
        throw new Error('multiple kinds with same name');
      }

      if (!existing) {
        throw new NotFoundException(
          `Kind with name ${kind.metadata.name} not found`,
        );
      }

      await trx('meta_kind_history').insert(existing);
      await trx('meta_kind').where('name', kind.metadata.name).del();
      const [updated, ...extraUpdate] = await trx('meta_kind')
        .insert<KindDBRecord>(
          fromUpdateRecord(
            kind,
            new UserContext(user),
            //this must come from the request (and not the current db state) otherwise the database optimistic locking wont work
            kind.history.id,
            message,
          ),
        )
        .returning('*');
      if (extraUpdate.length > 0) {
        this.logger.error('multiple kind updates returned');
        throw new Error('multiple kind updates returned');
      }
      if (!updated) {
        this.logger.error('no kind update returned');
        throw new Error('no kind update returned');
      }

      //TODO: this should be an API resource
      return Kind.fromDBRecord(existing);
    });

    // const { _rev, ...restExisting } = existing;

    // const name = KindRecord.splitID(kind._id).name;

    // const history = {
    //   ...restExisting,
    //   _id: History.createID(name, _rev, 'kind'),
    // };

    // let historyRev: string | undefined;

    // try {
    //   const res = await this.dbService.kindDB.put(history);
    //   historyRev = res.rev;
    //   const histID = res.id;

    //   const newDocument = {
    //     ...kind,
    //     history: new History({
    //       by: user,
    //       at: new Date().toISOString(),
    //       message,
    //       parent: histID,
    //     }),
    //   };

    //   const documentResult = await this.dbService.kindDB.put(newDocument);
    //   return await this.dbService.kindDB.get(documentResult.id);
    // } catch (e) {
    //   if (isPouchDBError(e)) {
    //     if (historyRev && e.docId !== history._id) {
    //       this.logger.debug(
    //         'reverting history document after creation failure',
    //       );
    //       this.dbService.kindDB.remove({ _id: history._id, _rev: historyRev });
    //       throw e;
    //     }
    //   }
    //   this.logger.error('unhandled error', e);
    //   throw e;
    // }
  }

  async createKind(
    kind: CreateKind,
    user: string,
    message?: string,
  ): Promise<Kind> {
    this.logger.debug('creating kind record', kind);

    const dbRecord = fromCreateRecord(kind, new UserContext(user), message);
    const resp = await this.dbService
      .client('meta_kind')
      .insert<KindDBRecord>(dbRecord)
      .returning('*');

    this.logger.log('created kind record', resp);

    return Kind.fromDBRecord(resp[0]);
  }
}
