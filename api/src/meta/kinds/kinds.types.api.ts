import { History } from 'src/types/types';
import {
  GlobalMetaApiResponse,
  CreateGlobalMetaApiBody,
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

export class CreateKindAPIBody {
  metadata: CreateGlobalMetaApiBody;
  //TODO: better validation of spec
  spec: Partial<KindSpec>;
  status?: any;
  state: string;
}

export class UpdateKindAPIBody {
  metadata: UpdateGlobalMetaApiBody;
  spec: Partial<KindSpec>;
  status?: any;
  state: string;
  history: Pick<History, 'id'>;

  constructor(partial: UpdateKindAPIBody) {
    Object.assign(this, partial);
    this.metadata = new GlobalMetaApiResponse(partial.metadata);
    //only take the id from the history. this is required for the update
    this.history = { id: partial.history.id };
  }

  static isUpdateKindAPIBody(body: any): body is UpdateKindAPIBody {
    console.log('testing', body);
    return body.history?.id !== undefined;
  }
}
