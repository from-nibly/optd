import { GlobalMetaApiResponse } from 'src/types/api.types';
import { GlobalMetaRecord, HistoryRecord } from 'src/types/record.types';

export class KindAPIResponse {
  metadata: GlobalMetaApiResponse<'kind'>;
  spec: any;
  status: any;
  history: HistoryRecord;

  constructor(partial: Partial<KindAPIResponse>) {
    Object.assign(this, partial);
    this.metadata = new GlobalMetaApiResponse(partial.metadata ?? {});
  }

  static fromRecord(record: KindRecord): KindAPIResponse {
    const [_, name] = record._id.split('/');
    return new KindAPIResponse({
      metadata: GlobalMetaApiResponse.fromRecord(
        record.metadata ?? {},
        'kind',
        name,
        record._rev,
      ),
      spec: record.spec,
      status: record.status,
      history: new HistoryRecord(record.history),
    });
  }
}

export class KindHookSpecRecord {
  postCreate?: string;
  validate?: string;
  postUpdate?: string;
  preUpdate?: string;

  constructor(partial: Partial<KindHookSpecRecord>) {
    Object.assign(this, partial);
  }
}

export class KindSpecRecord {
  hooks: KindHookSpecRecord;

  constructor(partial: Partial<KindSpecRecord>) {
    Object.assign(this, partial);
  }
}

export class KindRecord {
  metadata: GlobalMetaRecord;
  spec: KindHookSpecRecord;
  status: any;
  history: HistoryRecord;
  _rev: string;
  _id: string;

  constructor(partial: Partial<KindRecord>) {
    Object.assign(this, partial);
    this.metadata = new GlobalMetaRecord(partial.metadata ?? {});
  }
}
