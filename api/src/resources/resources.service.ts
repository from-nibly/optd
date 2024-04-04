import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/databases.service';
import { HooksService } from 'src/hooks/hooks.service';
import { CreateResource, Resource } from './resources.types';
import { UserContext } from 'src/types/types';

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

  async listResources(namespace: string, kind: string): Promise<Resource[]> {
    //TODO: pagination...
    const resp = await this.dbService
      .client(this.dbService.getKindTableName(kind))
      .select('*')
      .where('namespace', namespace);
    return resp.map((r) => Resource.fromDBRecord(kind, r));
  }

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

  async createResource(
    record: CreateResource,
    resourceKind: string,
    username: string,
    message: string,
  ): Promise<Resource> {
    return this.dbService.client.transaction(async (trx) => {
      await this.hookService.executeHook('preCreate', resourceKind, record);

      const dbRecord = record.toDBRecord(new UserContext(username), message);

      const newDBRecord = await trx(
        this.dbService.getKindTableName(record.metadata.kind),
      )
        .insert(dbRecord)
        .returning('*');

      const newRecord = Resource.fromDBRecord(
        record.metadata.kind,
        newDBRecord[0],
      );

      await this.hookService.executeHook('postCreate', resourceKind, newRecord);

      return newRecord;
    });
  }
}
