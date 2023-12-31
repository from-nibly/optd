import { GlobalMetaRecord, Record } from 'src/types/types.record';
import { CreateResource, Resource, UpdateResource } from './resources.types';
import {
  PutResourceAPIBody,
  UpdateResourceAPIBody,
} from './resources.types.api';

//TODO: implements record
export class ResourceRecord extends Resource {
  metadata: GlobalMetaRecord;
  _rev: string;
  _id: string;

  constructor(partial: ResourceRecord) {
    super(partial);
    this.metadata = new GlobalMetaRecord(partial.metadata);
    this._id = partial._id;
    this._rev = partial._rev;
  }

  static createID(namespace: string, name: string): string {
    return `ns/${namespace}/${name}`;
  }

  static splitID(id: string): { name: string; namespace: string } {
    const [_, namespace, name] = id.split('/');
    return { name, namespace };
  }
}

export class CreateResourceRecord extends CreateResource {
  _id: string;

  constructor(partial: CreateResourceRecord) {
    super(partial);
    this._id = partial._id;
  }

  static fromAPIBody(
    body: PutResourceAPIBody,
    namespace: string,
    name: string,
  ): CreateResourceRecord {
    return new CreateResourceRecord({
      metadata: new GlobalMetaRecord({
        labels: body.metadata.labels,
      }),
      _id: ResourceRecord.createID(namespace, name),
      spec: body.spec,
      status: body.status,
    });
  }
}

export class UpdateResourceRecord extends UpdateResource implements Record {
  _rev: string;
  _id: string;

  //TODO: update kind record should have specific things be made optional
  constructor(partial: UpdateResourceRecord) {
    super(partial);
    this._id = partial._id;
    this._rev = partial._rev;
  }

  static fromAPIBody(
    body: UpdateResourceAPIBody,
    namespace: string,
    name: string,
  ): UpdateResourceRecord {
    return new UpdateResourceRecord({
      metadata: new GlobalMetaRecord({
        labels: body.metadata.labels,
      }),
      _id: ResourceRecord.createID(namespace, name),
      _rev: body.metadata.rev,
      spec: body.spec,
      status: body.status,
    });
  }
}
