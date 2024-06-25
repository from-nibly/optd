import {
  GlobalCreateResource,
  GlobalResource,
  GlobalUpdateResource,
} from 'src/resources/resources.types';
import { ActorContext, History, NonMethodFields } from 'src/types/types';
import { CreateKindAPIBody, UpdateKindAPIBody } from './kinds.types.api';
import { KindDBRecord } from './kinds.types.record';
import { v4 as uuid } from 'uuid';
import { GlobalResourceDBRecord } from 'src/resources/resources.types.record';

export class KindHookSpec {
  validate?: string;
  preCreate?: string;
  postCreate?: string;
  preUpdate?: string;
  postUpdate?: string;
  preDelete?: string;
  postDelete?: string;

  constructor(obj: KindHookSpec) {
    Object.assign(this, obj);
  }
}

export class KindSpec {
  hooks: KindHookSpec;

  constructor(obj: Partial<KindSpec>) {
    //TODO better validation?
    this.hooks = obj.hooks ?? {};
  }
}

export class Kind extends GlobalResource {
  spec: KindSpec;
  is_meta: boolean;

  constructor(obj: NonMethodFields<Kind>) {
    super(obj);
    this.spec = new KindSpec(obj.spec);
    this.is_meta = obj.is_meta;
  }

  static fromDBRecord(record: KindDBRecord): Kind {
    return new Kind({
      metadata: {
        name: record.name,
        labels: record.metadata_labels,
        annotations: record.metadata_annotations,
        kind: Kind.kind,
      },
      history: new History({
        id: record.revision_id,
        by: record.revision_by,
        at: new Date(record.revision_at),
        message: record.revision_message,
        parent: record.revision_parent,
      }),
      spec: record.spec,
      status: record.status,
      state: record.state,
      is_meta: record.is_meta,
    });
  }

  static get kind(): 'kind' {
    return 'kind';
  }
}

export class CreateKind extends GlobalCreateResource {
  spec: KindSpec;
  is_meta: boolean;

  constructor(obj: NonMethodFields<CreateKind>) {
    super(obj);
    this.spec = new KindSpec(obj.spec ?? {});
    this.is_meta = obj.is_meta;
  }

  static fromAPIRequest(request: CreateKindAPIBody, name: string): CreateKind {
    return new CreateKind({
      metadata: {
        labels: request.metadata.labels,
        annotations: request.metadata.annotations,
        name,
        kind: Kind.kind,
      },
      spec: request.spec,
      is_meta: true,
    });
  }

  toDBRecord(actor: ActorContext, message?: string): KindDBRecord {
    return {
      name: this.metadata.name,
      metadata_annotations: this.metadata.annotations ?? {},
      metadata_labels: this.metadata.labels ?? {},
      status: {},
      state: 'pending',
      spec: this.spec,
      revision_id: uuid(),
      revision_at: new Date().toISOString(),
      revision_by: actor.subject.metadata.name,
      revision_message: message,
      revision_parent: null,
      is_meta: this.is_meta,
    };
  }
}

export class UpdateKind extends GlobalUpdateResource {
  spec: KindSpec;
  is_meta: boolean;

  constructor(obj: NonMethodFields<UpdateKind>) {
    super(obj);
    this.spec = new KindSpec(obj.spec);
    this.is_meta = obj.is_meta;
  }

  static fromAPIRequest(request: UpdateKindAPIBody, name: string): UpdateKind {
    return new UpdateKind({
      metadata: {
        ...request.metadata,
        name,
        kind: Kind.kind,
      },
      spec: request.spec,
      state: request.state,
      status: request.status,
      history: { id: request.history.id },
      is_meta: true,
    });
  }

  toDBRecord(actor: ActorContext, message?: string): KindDBRecord {
    return {
      name: this.metadata.name,
      metadata_annotations: this.metadata.annotations ?? {},
      metadata_labels: this.metadata.labels ?? {},
      status: this.status,
      state: this.state,
      spec: this.spec,
      revision_id: uuid(),
      revision_at: new Date().toISOString(),
      revision_by: actor.subject.metadata.name,
      revision_message: message,
      revision_parent: this.history.id,
      is_meta: this.is_meta,
    };
  }
}
