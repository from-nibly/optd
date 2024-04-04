import { History } from 'src/types/types';
import {
  CreateNamespacedMetaApiBody,
  NamespacedMetaApiResponse,
  UpdateNamespacedMetaApiBody,
} from 'src/types/types.api';
import { Resource, UpdateResource } from './resources.types';

export class ResourceAPIResponse {
  metadata: NamespacedMetaApiResponse;
  spec: any;
  status: any;
  history: History;
  state: string;

  constructor(partial: ResourceAPIResponse) {
    this.metadata = new NamespacedMetaApiResponse(partial.metadata);
    this.spec = partial.spec;
    this.status = partial.status;
    this.history = partial.history;
    this.state = partial.state;
  }

  static fromRecord(record: Resource, kind: string): ResourceAPIResponse {
    console.log('record', record, kind);
    return new ResourceAPIResponse({
      metadata: NamespacedMetaApiResponse.fromRecord(record.metadata, kind),
      spec: record.spec,
      status: record.status,
      history: record.history,
      state: record.state,
    });
  }
}

export class CreateResourceAPIBody {
  metadata: CreateNamespacedMetaApiBody;
  spec: any;
  status: any;
  state: string;
}

export class UpdateResourceAPIBody {
  metadata: UpdateNamespacedMetaApiBody;
  spec: any;
  status: any;
  state: string;
  history: Pick<History, 'id'>;

  constructor(partial: UpdateResourceAPIBody) {
    Object.assign(this, partial);
    this.metadata = new UpdateNamespacedMetaApiBody(partial.metadata);
    this.history = { id: partial.history.id };
  }

  static isUpdateResourceAPIBody(body: any): body is UpdateResourceAPIBody {
    return body.history?.id !== undefined;
  }
}
