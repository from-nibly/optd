import { History } from 'src/types/types';
import { NamespacedMetaApiResponse } from 'src/types/types.api';
import { Resource } from './resources.types';

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
  }

  static fromRecord(record: Resource, kind: string): ResourceAPIResponse {
    return new ResourceAPIResponse({
      metadata: NamespacedMetaApiResponse.fromRecord(record.metadata, kind),
      spec: record.spec,
      status: record.status,
      history: record.history,
      state: record.state,
    });
  }
}

// export class PutResourceAPIBody extends UpdateResource {
//   metadata: NamespacedMetaApiResponse;
// }

// export class UpdateResourceAPIBody extends UpdateResource {
//   metadata: UpdateGlobalMetaApiBody;

//   constructor(partial: UpdateResourceAPIBody) {
//     super(partial);
//   }

//   static isUpdateResourceAPIBody(
//     body: PutResourceAPIBody | UpdateResourceAPIBody,
//   ): body is UpdateResourceAPIBody {
//     return false;
//   }
// }
