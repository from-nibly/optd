import { History } from 'src/types/types';
import {
  GlobalMetaApiResponse,
  PutGlobalMetaApiBody,
  UpdateGlobalMetaApiBody,
} from 'src/types/types.api';
import { KindSpec, UpdateKind } from './kinds.types';
import { KindRecord } from './kinds.types.record';

export class KindAPIResponse {
  metadata: GlobalMetaApiResponse<'kind'>;
  spec: KindSpec;
  status: any;
  history: History;

  constructor(partial: KindAPIResponse) {
    Object.assign(this, partial);
    this.metadata = new GlobalMetaApiResponse(partial.metadata);
  }

  static fromRecord(record: KindRecord): KindAPIResponse {
    return new KindAPIResponse({
      metadata: GlobalMetaApiResponse.fromRecord(
        record.metadata,
        'kind',
        KindRecord.splitID(record._id).name,
        record._rev,
      ),
      spec: record.spec,
      status: record.status,
      history: new History(record.history),
    });
  }
}

export class PutKindAPIBody extends UpdateKind {
  metadata: PutGlobalMetaApiBody;
}

export class UpdateKindAPIBody extends UpdateKind {
  metadata: UpdateGlobalMetaApiBody;

  constructor(partial: UpdateKindAPIBody) {
    super(partial);
  }

  static isUpdateKindAPIBody(
    body: PutKindAPIBody | UpdateKindAPIBody,
  ): body is UpdateKindAPIBody {
    return body.metadata.rev !== undefined;
  }
}
