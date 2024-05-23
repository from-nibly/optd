import { History } from 'src/types/types';
import {
  GlobalCreateMetaApiBody,
  GlobalMetaAPIResponse,
} from 'src/types/types.api';
import { Cron, CronSpec } from './crons.types';
import {
  GlobalCreateResourceAPIBody,
  GlobalResourceAPIResponse,
  GlobalUpdateResourceAPIBody,
} from 'src/resources/resources.types.api';

export class CronAPIResponse extends GlobalResourceAPIResponse {
  metadata: GlobalMetaAPIResponse;
  spec: CronSpec;
  status: any;
  history: History;
  state: string;

  constructor(obj: CronAPIResponse) {
    super(obj);
    this.spec = new CronSpec(obj.spec);
  }

  static fromRecord(record: Cron, kind: string = 'cron'): CronAPIResponse {
    return new CronAPIResponse({
      metadata: GlobalMetaAPIResponse.fromRecord(record.metadata, kind),
      spec: new CronSpec(record.spec),
      status: record.status,
      history: record.history,
      state: record.state,
    });
  }
}

export class CreateCronAPIBody extends GlobalCreateResourceAPIBody {
  metadata: GlobalCreateMetaApiBody;
  spec: any;
}

export class UpdateCronAPIBody extends GlobalUpdateResourceAPIBody {
  metadata: GlobalCreateMetaApiBody;
  spec: any;
  status: any;
  state: string;
  history: Pick<History, 'id'>;

  constructor(obj: UpdateCronAPIBody) {
    super(obj);
    this.spec = new CronSpec(obj.spec);
  }

  static isUpdateCronAPIBody(body: any): body is UpdateCronAPIBody {
    return body.history?.id !== undefined;
  }
}
