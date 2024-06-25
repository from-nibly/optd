import {
  GlobalCreateResourceAPIBody,
  GlobalResourceAPIResponse,
  GlobalUpdateResourceAPIBody,
} from 'src/resources/resources.types.api';
import { History, NonMethodFields } from 'src/types/types';
import {
  GlobalCreateMetaApiBody,
  GlobalMetaAPIResponse,
  GlobalUpdateMetaApiBody,
} from 'src/types/types.api';
import { Kind, KindSpec } from './kinds.types';

export class KindAPIResponse extends GlobalResourceAPIResponse {
  metadata: GlobalMetaAPIResponse<typeof Kind.kind>;
  spec: KindSpec;
  status: any;
  history: History;
  state: string;
  is_meta: boolean;

  constructor(obj: KindAPIResponse) {
    super(obj);
    this.spec = new KindSpec(obj.spec);
    this.is_meta = obj.is_meta;
  }

  static fromRecord(record: Kind): KindAPIResponse {
    return new KindAPIResponse({
      metadata: GlobalMetaAPIResponse.fromRecord(record.metadata, Kind.kind),
      spec: record.spec,
      status: record.status,
      history: new History(record.history),
      state: record.state,
      is_meta: record.is_meta,
    });
  }
}

export class CreateKindAPIBody extends GlobalCreateResourceAPIBody {
  metadata: GlobalCreateMetaApiBody;
  spec: KindSpec;

  constructor(object: NonMethodFields<CreateKindAPIBody>) {
    super(object);
    this.spec = new KindSpec(object.spec);
  }
}

export class UpdateKindAPIBody extends GlobalUpdateResourceAPIBody {
  metadata: GlobalUpdateMetaApiBody;
  spec: KindSpec;
  status: any;
  state: string;
  history: Pick<History, 'id'>;

  constructor(object: NonMethodFields<UpdateKindAPIBody>) {
    super(object);
    this.spec = new KindSpec(object.spec);
  }

  static isUpdateKindAPIBody(body: any): body is UpdateKindAPIBody {
    return body.history?.id !== undefined;
  }
}
