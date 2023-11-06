import { GlobalMetaRecord } from 'src/types/types.record';
import { CreateKind, Kind, UpdateKind } from './kind.types';
import { PutKindAPIBody, UpdateKindAPIBody } from './kind.types.api';

class Record {
  _rev: string;
  _id: string;
}

export class KindRecord extends Kind implements Record {
  _rev: string;
  _id: string;

  constructor(partial: KindRecord) {
    super(partial);
    this._id = partial._id;
    this._rev = partial._rev;
    this.metadata = new GlobalMetaRecord(partial.metadata ?? {});
  }

  static createID(name: string): string {
    return `kind/${name}`;
  }
}

export class CreateKindRecord extends CreateKind {
  _id: string;

  constructor(partial: CreateKindRecord) {
    super(partial);
    this._id = partial._id;
  }

  static fromAPIBody(body: PutKindAPIBody, name: string): CreateKindRecord {
    return new CreateKindRecord({
      metadata: new GlobalMetaRecord({
        labels: body.metadata.labels,
      }),
      _id: KindRecord.createID(name),
      spec: body.spec,
    });
  }
}

export class UpdateKindRecord extends UpdateKind implements Record {
  _rev: string;
  _id: string;

  //TODO: update kind record should have specific things be made optional
  constructor(partial: UpdateKindRecord) {
    super(partial);
    this._id = partial._id;
    this._rev = partial._rev;
  }

  static fromAPIBody(body: UpdateKindAPIBody, name: string): UpdateKindRecord {
    return new UpdateKindRecord({
      metadata: new GlobalMetaRecord({
        labels: body.metadata.labels,
      }),
      _id: KindRecord.createID(name),
      _rev: body.metadata.rev,
      spec: body.spec,
      status: body.status,
    });
  }
}
