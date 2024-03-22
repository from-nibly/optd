import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/databases.service';
import { HooksService } from 'src/hooks/hooks.service';
import { History } from 'src/types/types';
import { isPouchDBError } from 'src/utils.types';
import {
  CreateResourceRecord,
  ResourceRecord,
  UpdateResourceRecord,
} from './resources.types.record';

@Injectable()
export class ResourceService {
  private readonly logger = new Logger(ResourceService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly hookService: HooksService,
  ) {}

  // private getDatabase(resourceKind: string) {
  //   return this.dbService.getDatabase(resourceKind);
  // }

  // async listResources(
  //   namespace: string,
  //   resourceKind: string,
  // ): Promise<ResourceRecord[]> {
  //   const resp = await this.getDatabase(resourceKind).allDocs({
  //     startkey: `ns/${namespace}/`,
  //     endkey: `ns/${namespace}/{}`,
  //     include_docs: true,
  //   });

  //   return resp.rows.map((r) => new ResourceRecord(r.doc!));
  // }

  // async getResource(
  //   namespace: string,
  //   resourceKind: string,
  //   name: string,
  // ): Promise<ResourceRecord> {
  //   const resp = await this.getDatabase(resourceKind).get(
  //     ResourceRecord.createID(namespace, name),
  //   );
  //   return new ResourceRecord(resp);
  // }

  // async revertHistory(kind: string, id: string, rev: string) {
  //   this.getDatabase(kind).remove({
  //     _id: id,
  //     _rev: rev,
  //   });
  // }

  // async updateResource(
  //   record: UpdateResourceRecord,
  //   resourceKind: string,
  //   username: string,
  //   message: string,
  // ): Promise<ResourceRecord> {
  //   const existing = await this.getDatabase(resourceKind).get(record._id);
  //   const { _rev, ...restExisting } = existing;

  //   const name = ResourceRecord.splitID(record._id).name;

  //   const history = {
  //     ...restExisting,
  //     _id: History.createID(name, _rev, resourceKind),
  //   };

  //   let historyRev: string | undefined;

  //   try {
  //     const res = await this.getDatabase(resourceKind).put(history);
  //     historyRev = res.rev;
  //     const histID = res.id;

  //     const newRecord = {
  //       ...record,
  //       history: new History({
  //         by: username,
  //         at: new Date().toISOString(),
  //         message,
  //         parent: histID,
  //       }),
  //     };

  //     await this.hookService.executeHook(
  //       'preUpdate',
  //       resourceKind,
  //       newRecord,
  //       (err) => this.revertHistory(resourceKind, histID, historyRev!),
  //     );

  //     const recordResult = await this.getDatabase(resourceKind).put(newRecord);
  //     const updatedRecord = await this.getDatabase(resourceKind).get(
  //       recordResult.id,
  //     );

  //     //TODO: no rollback on postUpdate right?
  //     await this.hookService.executeHook(
  //       'postUpdate',
  //       resourceKind,
  //       updatedRecord,
  //     );

  //     return updatedRecord;
  //   } catch (e) {
  //     if (isPouchDBError(e)) {
  //       if (historyRev && e.docId !== history._id) {
  //         this.logger.error(
  //           'reverting history document after creation failure',
  //         );

  //         throw e;
  //       }
  //     }
  //     this.logger.error('unhandled error', e);
  //     throw e;
  //   }
  // }

  // async createResource(
  //   record: CreateResourceRecord,
  //   resourceKind: string,
  //   username: string,
  //   message: string,
  // ): Promise<ResourceRecord> {
  //   const newRecord = {
  //     ...record,
  //     history: new History({
  //       by: username,
  //       at: new Date().toISOString(),
  //       message,
  //       parent: null,
  //     }),
  //   };

  //   await this.hookService.executeHook('preCreate', resourceKind, newRecord);

  //   const result = await this.getDatabase(resourceKind).put(newRecord);

  //   const resultRecord = await this.getDatabase(resourceKind).get(result.id);

  //   await this.hookService.executeHook(
  //     'postCreate',
  //     resourceKind,
  //     resultRecord,
  //   );

  //   return resultRecord;
  // }
}
