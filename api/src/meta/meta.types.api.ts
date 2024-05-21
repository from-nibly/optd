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
import { Meta } from 'src/meta/meta.types';

export class MetaAPIResponse extends GlobalResourceAPIResponse {
  metadata: GlobalMetaAPIResponse<'Meta'>;
  spec: any;
  status: any;
  history: History;
  state: string;

  constructor(obj: MetaAPIResponse) {
    super(obj);
    this.spec = obj.spec;
  }

  static fromRecord(record: Meta): MetaAPIResponse {
    return new MetaAPIResponse({
      metadata: GlobalMetaAPIResponse.fromRecord(record.metadata, 'Meta'),
      spec: record.spec,
      status: record.status,
      history: new History(record.history),
      state: record.state,
    });
  }
}

export class CreateMetaAPIBody extends GlobalCreateResourceAPIBody {
  metadata: GlobalCreateMetaApiBody;
  spec: any;

  constructor(object: NonMethodFields<CreateMetaAPIBody>) {
    super(object);
    this.spec = object.spec;
  }
}

export class UpdateMetaAPIBody extends GlobalUpdateResourceAPIBody {
  metadata: GlobalUpdateMetaApiBody;
  spec: any;
  status: any;
  state: string;
  history: Pick<History, 'id'>;

  constructor(object: NonMethodFields<UpdateMetaAPIBody>) {
    super(object);
    this.spec = object.spec;
  }

  static isUpdateMetaAPIBody(body: any): body is UpdateMetaAPIBody {
    return body.history?.id !== undefined;
  }
}
