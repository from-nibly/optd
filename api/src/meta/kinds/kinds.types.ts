import {
  GlobalMeta,
  GlobalRecord,
  History,
  NonMethodFields,
} from 'src/types/types';
import { KindDBRecord } from './kinds.types.record';

export class KindHookSpec {
  validate?: string;
  preCreate?: string;
  postCreate?: string;
  preUpdate?: string;
  postUpdate?: string;
  preDelete?: string;
  postDelete?: string;

  constructor(partial: KindHookSpec) {
    Object.assign(this, partial);
  }
}

export class KindSpec {
  hooks: KindHookSpec;

  constructor(obj: KindSpec) {
    //TODO better validation?
    Object.assign(this, obj);
  }
}

export class Kind extends GlobalRecord {
  metadata: GlobalMeta;
  spec: KindSpec;
  status: any;
  history: History;

  constructor(obj: NonMethodFields<Kind>) {
    super(obj);
    //TODO is this redundant?
    this.spec = new KindSpec(obj.spec);
  }

  static fromDBRecord(record: KindDBRecord): Kind {
    return new Kind({
      metadata: {
        name: record.name,
        labels: record.labels,
        annotations: record.annotations,
      },
      spec: {
        hooks: record.spec.hooks,
      },
      state: record.state,
      status: record.status,
      history: {
        id: record.revision_id,
        by: record.revision_by,
        at: record.revision_at,
        message: record.revision_message,
        parent: null,
      },
    });
  }
}

// export class CreateKind {
//   metadata: GlobalMeta;
//   spec: KindSpec;

//   constructor(partial: CreateKind) {
//     this.metadata = new GlobalMeta(partial.metadata);
//     this.spec = new KindSpec(partial.spec);
//   }
// }

// export class UpdateKind {
//   metadata: UpdateGlobalMeta;
//   spec: KindSpec;
//   status: any;

//   constructor(partial: UpdateKind) {
//     this.metadata = new UpdateGlobalMeta(partial.metadata);
//     this.spec = new KindSpec(partial.spec);
//     this.status = partial.status;
//   }
// }
