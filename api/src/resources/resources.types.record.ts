import { GlobalDBRecord } from 'src/types/types.record';
import { CreateResource, Resource, UpdateResource } from './resources.types';
import {
  PutResourceAPIBody,
  UpdateResourceAPIBody,
} from './resources.types.api';
import { GlobalMeta } from 'src/types/types';

export class ResourceRecord extends Resource {
  metadata: GlobalMeta;
  _rev: string;
  _id: string;

  constructor(partial: ResourceRecord) {
    super(partial);
    this.metadata = new GlobalMeta(partial.metadata);
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
      metadata: new GlobalMeta({
        labels: body.metadata.labels,
        annotations: body.metadata.annotations,
        name: body.metadata.name,
      }),
      _id: ResourceRecord.createID(namespace, name),
      spec: body.spec,
      status: body.status,
    });
  }
}

export class UpdateResourceRecord extends UpdateResource {
  constructor(partial: UpdateResourceRecord) {
    super(partial);
  }

  static fromAPIBody(
    body: UpdateResourceAPIBody,
    namespace: string,
    name: string,
  ): UpdateResourceRecord {
    return new UpdateResourceRecord({
      metadata: new GlobalMeta({
        labels: body.metadata.labels,
        annotations: body.metadata.annotations,
        name: body.metadata.name,
      }),
      spec: body.spec,
      status: body.status,
    });
  }
}
