import { History } from 'src/types/types';
import {
  GlobalMetaApiResponse,
  PutGlobalMetaApiBody,
  UpdateGlobalMetaApiBody,
} from 'src/types/types.api';
import { Kind, KindSpec } from './kinds.types';

export class KindAPIResponse {
  metadata: GlobalMetaApiResponse<'Kind'>;
  spec: KindSpec;
  status: any;
  history: History;
  state: string;

  constructor(partial: KindAPIResponse) {
    Object.assign(this, partial);
    this.metadata = new GlobalMetaApiResponse(partial.metadata);
  }

  static fromRecord(record: Kind): KindAPIResponse {
    return new KindAPIResponse({
      metadata: GlobalMetaApiResponse.fromRecord(record.metadata, 'Kind'),
      spec: record.spec,
      status: record.status,
      history: new History(record.history),
      state: record.state,
    });
  }
}

export class PutKindAPIBody {
  metadata: PutGlobalMetaApiBody;
}

export class UpdateKindAPIBody {
  metadata: UpdateGlobalMetaApiBody;

  constructor(partial: UpdateKindAPIBody) {}

  static isUpdateKindAPIBody(
    body: PutKindAPIBody | UpdateKindAPIBody,
  ): body is UpdateKindAPIBody {
    return body.metadata.rev !== undefined;
  }
}
