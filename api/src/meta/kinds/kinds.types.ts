import {
  CreateGlobalMeta,
  CreateGlobalRecord,
  GlobalMeta,
  GlobalRecord,
  History,
  NonMethodFields,
  UserContext,
} from 'src/types/types';
import { CreateKindAPIBody, UpdateKindAPIBody } from './kinds.types.api';
import { KindDBRecord } from './kinds.types.record';
import { v4 as uuid } from 'uuid';

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
        kind: 'Kind',
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
  constructor(partial: NonMethodFields<CreateKind>) {
    super(partial);
    this.metadata = new CreateGlobalMeta(partial.metadata);
    this.spec = new KindSpec(partial.spec ?? {});
    this.state = 'pending';
    this.status = partial.status ?? {};
  }

  static fromApiRequest(request: CreateKindAPIBody): CreateKind {
    return new CreateKind({
      metadata: request.metadata,
      spec: request.spec,
      state: 'pending',
      status: request.status,
    });
  }

  toDBRecord(actor: UserContext, message?: string): KindDBRecord {
    return {
      name: this.metadata.name,
      metadata_annotations: this.metadata.annotations ?? {},
      metadata_labels: this.metadata.labels ?? {},
      status: this.status ?? {},
      state: 'pending',
      spec: this.spec,
      revision_id: uuid(),
      revision_at: new Date().toISOString(),
      revision_by: actor.username,
      revision_message: message,
      revision_parent: null,
    };
  }
}

export class UpdateKind {
  metadata: GlobalMeta;
  spec: KindSpec;
  status: any;
  state: string;
  history: Pick<History, 'id'>;

  constructor(partial: NonMethodFields<UpdateKind>) {
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

  toDBRecord(
    actor: UserContext,
    parent_revision: string,
    message: string | undefined,
  ): KindDBRecord {
    return {
      name: this.metadata.name,
      metadata_annotations: this.metadata.annotations,
      metadata_labels: this.metadata.labels,
      status: this.status,
      state: this.state,
      spec: this.spec,
      revision_id: uuid(),
      revision_at: new Date().toISOString(),
      revision_by: actor.username,
      revision_message: message,
      revision_parent: parent_revision,
    };
  }
}
