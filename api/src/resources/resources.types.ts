import {
  ActorContext,
  GlobalCreateMeta,
  GlobalMeta,
  History,
  NamespacedCreateMeta,
  NamespacedMeta,
  NonMethodFields,
} from 'src/types/types';
import { v4 as uuid } from 'uuid';
import {
  GlobalCreateResourceAPIBody,
  GlobalUpdateResourceAPIBody,
  NamespacedCreateResourceAPIBody,
  NamespacedUpdateResourceAPIBody,
} from './resources.types.api';
import {
  GlobalResourceDBRecord,
  NamespacedResourceDBRecord,
} from './resources.types.record';

export class HookableResource {
  metadata: NamespacedMeta;
  spec: any;
  status: any;
  history?: History;
  state: string;

  constructor(obj: NamespacedResource) {
    this.metadata = new NamespacedMeta(obj.metadata);
    this.spec = obj.spec;
    this.status = obj.status;
    this.history = obj.history ? new History(obj.history) : undefined;
    this.state = obj.state;
  }
}

//TODO: dedupe?
export class GlobalResource {
  metadata: GlobalMeta;
  spec: any;
  status: any;
  history: History;
  state: string;

  constructor(obj: NonMethodFields<GlobalResource>) {
    this.metadata = new GlobalMeta(obj.metadata);
    this.spec = obj.spec;
    this.status = obj.status;
    this.history = new History(obj.history);
    this.state = obj.state;
  }

  toPath(): string {
    return `/global/${this.metadata.kind}/${this.metadata.name}`;
  }

  static fromDBRecord(
    record: NonMethodFields<GlobalResourceDBRecord>,
    kind: string,
    ctor: typeof GlobalResource = GlobalResource,
  ): GlobalResource {
    return new ctor({
      metadata: {
        name: record.name,
        labels: record.metadata_labels,
        annotations: record.metadata_annotations,
        kind: kind,
      },
      history: new History({
        id: record.revision_id,
        by: record.revision_by,
        at: record.revision_at,
        message: record.revision_message,
        parent: record.revision_parent,
      }),
      spec: record.spec,
      status: record.status,
      state: record.state,
    });
  }

  static get kind(): string {
    throw new Error('kind getter not implemented');
  }
}

export class NamespacedResource {
  metadata: NamespacedMeta;
  spec: any;
  status: any;
  history: History;
  state: string;

  constructor(obj: NonMethodFields<NamespacedResource>) {
    this.metadata = new NamespacedMeta(obj.metadata);
    this.spec = obj.spec;
    this.status = obj.status;
    this.history = new History(obj.history);
    this.state = obj.state;
  }

  toPath(): string {
    return `/global/${this.metadata.kind}/${this.metadata.name}`;
  }

  static fromDBRecord(
    kind: string,
    record: NonMethodFields<NamespacedResourceDBRecord>,
    ctor: typeof NamespacedResource = NamespacedResource,
  ): NamespacedResource {
    return new ctor({
      metadata: {
        name: record.name,
        namespace: record.namespace,
        labels: record.metadata_labels,
        annotations: record.metadata_annotations,
        kind: kind,
      },
      history: new History({
        id: record.revision_id,
        by: record.revision_by,
        at: record.revision_at,
        message: record.revision_message,
        parent: record.revision_parent,
      }),
      spec: record.spec,
      status: record.status,
      state: record.state,
    });
  }
}

export class GlobalCreateResource {
  metadata: GlobalCreateMeta;
  spec: any;

  constructor(obj: NonMethodFields<GlobalCreateResource>) {
    this.metadata = new GlobalCreateMeta(obj.metadata);
    this.spec = obj.spec;
  }

  static fromAPIRequest<T extends GlobalCreateResourceAPIBody>(
    request: T,
    name: string,
    kind: string,
    ctor: typeof GlobalCreateResource = GlobalCreateResource,
  ): GlobalCreateResource {
    return new ctor({
      metadata: {
        labels: request.metadata.labels,
        annotations: request.metadata.annotations,
        name,
        kind,
      },
      spec: request.spec,
    });
  }

  toDBRecord(actor: ActorContext, message?: string): GlobalResourceDBRecord {
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
    };
  }
}

export class NamespacedCreateResource {
  metadata: NamespacedCreateMeta;
  spec: Record<string, any>;

  constructor(obj: NonMethodFields<NamespacedCreateResource>) {
    this.metadata = new NamespacedCreateMeta(obj.metadata);
    this.spec = obj.spec;
  }

  static fromAPIRequest(
    request: NamespacedCreateResourceAPIBody,
    kind: string,
    namespace: string,
    name: string,
    ctor: typeof NamespacedCreateResource = NamespacedCreateResource,
  ): NamespacedCreateResource {
    console.log('request', request, kind);
    return new ctor({
      metadata: {
        labels: request.metadata.labels,
        annotations: request.metadata.annotations,
        namespace,
        name,
        kind,
      },
      spec: request.spec,
    });
  }

  toDBRecord(
    actor: ActorContext,
    message?: string,
  ): NamespacedResourceDBRecord {
    return {
      name: this.metadata.name,
      namespace: this.metadata.namespace,
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
    };
  }
}

export class GlobalUpdateResource {
  metadata: GlobalMeta;
  spec: any;
  status: any;
  state: string;
  history: Pick<History, 'id'>;

  constructor(obj: NonMethodFields<GlobalUpdateResource>) {
    this.metadata = new GlobalMeta(obj.metadata);
    this.spec = obj.spec;
    this.status = obj.status;
    this.state = obj.state;
    this.history = { id: obj.history.id };
  }

  static fromAPIRequest(
    request: GlobalUpdateResourceAPIBody,
    name: string,
    kind: string,
    ctor: typeof GlobalUpdateResource = GlobalUpdateResource,
  ): GlobalUpdateResource {
    return new ctor({
      metadata: {
        ...request.metadata,
        name,
        kind,
      },
      spec: request.spec,
      state: request.state,
      status: request.status,
      history: { id: request.history.id },
    });
  }

  toDBRecord<T extends GlobalResourceDBRecord>(
    actor: ActorContext,
    parent_revision: string,
    message?: string,
  ): T {
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
      revision_parent: parent_revision,
    } as T;
  }
}

export class NamespacedUpdateResource {
  metadata: NamespacedMeta;
  spec: Record<string, any>;
  status: Record<string, any>;
  state: string;
  history: Pick<History, 'id'>;

  constructor(obj: NonMethodFields<NamespacedUpdateResource>) {
    this.metadata = new NamespacedMeta(obj.metadata);
    this.spec = obj.spec;
    this.status = obj.status;
    this.state = obj.state;
    this.history = { id: obj.history.id };
  }

  static fromAPIRequest(
    request: NamespacedUpdateResourceAPIBody,
    namespace: string,
    name: string,
    ctor: typeof NamespacedUpdateResource = NamespacedUpdateResource,
  ): NamespacedUpdateResource {
    return new ctor({
      metadata: {
        ...request.metadata,
        namespace,
        name,
      },
      spec: request.spec,
      state: request.state,
      status: request.status,
      history: { id: request.history.id },
    });
  }

  toDBRecord(
    actor: ActorContext,
    parent_revision: string,
    message?: string,
  ): NamespacedResourceDBRecord {
    return {
      name: this.metadata.name,
      namespace: this.metadata.namespace,
      metadata_annotations: this.metadata.annotations ?? {},
      metadata_labels: this.metadata.labels ?? {},
      status: this.status,
      state: this.state,
      spec: this.spec,
      revision_id: uuid(),
      revision_at: new Date().toISOString(),
      revision_by: actor.subject.metadata.name,
      revision_message: message,
      revision_parent: parent_revision,
    };
  }
}
