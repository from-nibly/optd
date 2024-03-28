import {
  CreateGlobalMeta,
  CreateGlobalRecord,
  GlobalMeta,
  GlobalRecord,
  History,
  NonMethodFields,
  UserContext,
} from 'src/types/types';
import { PutKindAPIBody, UpdateKindAPIBody } from './kinds.types.api';
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

  constructor(obj: Partial<KindSpec>) {
    //TODO better validation?
    this.hooks = obj.hooks ?? {};
  }
}

export class Kind extends GlobalRecord {
  spec: KindSpec;

  constructor(obj: NonMethodFields<Kind>) {
    super(obj);
    this.spec = new KindSpec(obj.spec);
  }

  static fromDBRecord(record: KindDBRecord): Kind {
    return new Kind({
      metadata: {
        name: record.name,
        labels: record.metadata_labels,
        annotations: record.metadata_annotations,
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
        parent: record.revision_parent,
      },
    });
  }
}

export class CreateKind extends CreateGlobalRecord {
  constructor(partial: CreateKind) {
    super(partial);
    this.metadata = new CreateGlobalMeta(partial.metadata);
    this.spec = new KindSpec(partial.spec ?? {});
    this.state = 'pending';
    this.status = partial.status ?? {};
  }

  static fromApiRequest(request: PutKindAPIBody): CreateKind {
    return new CreateKind({
      metadata: request.metadata,
      spec: request.spec,
      state: 'pending',
      status: request.status,
    });
  }
}

export class UpdateKind {
  metadata: GlobalMeta;
  spec: KindSpec;
  status: any;
  state: string;
  history: Pick<History, 'id'>;

  constructor(partial: UpdateKind) {
    this.metadata = new GlobalMeta(partial.metadata);
    this.spec = new KindSpec(partial.spec);
    this.status = partial.status;
    this.state = partial.state;
    this.history = partial.history;
  }

  static fromApiRequest(request: UpdateKindAPIBody): UpdateKind {
    return new UpdateKind({
      metadata: request.metadata,
      spec: {
        hooks: request.spec.hooks ?? {},
      },
      state: request.state,
      status: request.status,
      history: {
        id: request.history.id,
      },
    });
  }
}
