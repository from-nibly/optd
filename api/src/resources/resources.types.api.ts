import {
  NamespacedMetaApiResponse,
  UpdateGlobalMetaApiBody,
} from 'src/types/types.api';
import { ResourceRecord } from './resources.types.record';
import { History } from 'src/types/types';
import { UpdateResource } from './resources.types';

export class ResourceAPIResponse {
  metadata: NamespacedMetaApiResponse;
  spec: any;
  status: any;
  history: History;

  constructor(partial: ResourceAPIResponse) {
    this.metadata = new NamespacedMetaApiResponse(partial.metadata);
    this.spec = partial.spec;
    this.status = partial.status;
    this.history = partial.history;
  }

  static fromRecord(record: ResourceRecord, kind: string): ResourceAPIResponse {
    return new ResourceAPIResponse({
      metadata: {
        ...record.metadata,
        kind,
        name: ResourceRecord.splitID(record._id).name,
        namespace: ResourceRecord.splitID(record._id).namespace,
      },
      spec: record.spec,
      status: record.status,
      history: new History(record.history),
    });
  }
}

export class PutResourceAPIBody extends UpdateResource {
  metadata: NamespacedMetaApiResponse;
}

export class UpdateResourceAPIBody extends UpdateResource {
  metadata: UpdateGlobalMetaApiBody;

  constructor(partial: UpdateResourceAPIBody) {
    super(partial);
  }

  static isUpdateResourceAPIBody(
    body: PutResourceAPIBody | UpdateResourceAPIBody,
  ): body is UpdateResourceAPIBody {
    return false;
  }
}
