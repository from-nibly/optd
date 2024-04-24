import {
  GlobalCreateMeta,
  NamespacedCreateMeta,
  GlobalMeta,
  History,
  NamespacedMeta,
  NonMethodFields,
} from 'src/types/types';
import {
  GlobalResourceDBRecord,
  NamespacedResourceDBRecord,
} from './resources.types.record';
import {
  GlobalCreateResourceAPIBody,
  GlobalUpdateResourceAPIBody,
  NamespacedCreateResourceAPIBody,
  NamespacedUpdateResourceAPIBody,
} from './resources.types.api';
import { v4 as uuid } from 'uuid';
import { Subject } from 'src/subjects/subjects.types';

export class HookableResource {
  metadata: NamespacedMeta;
  spec: any;
  status: any;
  history?: History;
  state: string;

  constructor(partial: NamespacedResource) {
    this.metadata = new NamespacedMeta(partial.metadata);
    this.spec = partial.spec;
    this.status = partial.status;
    this.history = partial.history ? new History(partial.history) : undefined;
    this.state = partial.state;
  }
}

//TODO: dedupe?
export class GlobalResource {
  metadata: GlobalMeta;
  spec: any;
  status: any;
  history: History;
  state: string;

  constructor(partial: GlobalResource) {
    this.metadata = new GlobalMeta(partial.metadata);
    this.spec = partial.spec;
    this.status = partial.status;
    this.history = new History(partial.history);
    this.state = partial.state;
  }

  static fromDBRecord(
    record: GlobalResourceDBRecord,
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
}

export class NamespacedResource {
  metadata: NamespacedMeta;
  spec: any;
  status: any;
  history: History;
  state: string;

  constructor(partial: NamespacedResource) {
    this.metadata = new NamespacedMeta(partial.metadata);
    this.spec = partial.spec;
    this.status = partial.status;
    this.history = new History(partial.history);
    this.state = partial.state;
  }

  static fromDBRecord(
    kind: string,
    record: NamespacedResourceDBRecord,
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

  constructor(partial: NonMethodFields<GlobalCreateResource>) {
    this.metadata = new GlobalCreateMeta(partial.metadata);
    this.spec = partial.spec;
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

  toDBRecord(actor: Subject, message?: string): GlobalResourceDBRecord {
    return {
      name: this.metadata.name,
      metadata_annotations: this.metadata.annotations ?? {},
      metadata_labels: this.metadata.labels ?? {},
      status: {},
      state: 'pending',
      spec: this.spec,
      revision_id: uuid(),
      revision_at: new Date().toISOString(),
      revision_by: actor.metadata.name,
      revision_message: message,
      revision_parent: null,
    };
  }
}

export class NamespacedCreateResource {
  metadata: NamespacedCreateMeta;
  spec: Record<string, any>;

  constructor(partial: NonMethodFields<NamespacedCreateResource>) {
    this.metadata = new NamespacedCreateMeta(partial.metadata);
    this.spec = partial.spec;
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

  toDBRecord(actor: Subject, message?: string): NamespacedResourceDBRecord {
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
      revision_by: actor.metadata.name,
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

  constructor(partial: NonMethodFields<GlobalUpdateResource>) {
    this.metadata = new GlobalMeta(partial.metadata);
    this.spec = partial.spec;
    this.status = partial.status;
    this.state = partial.state;
    this.history = { id: partial.history.id };
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

  toDBRecord(
    actor: Subject,
    parent_revision: string,
    message?: string,
  ): GlobalResourceDBRecord {
    return {
      name: this.metadata.name,
      metadata_annotations: this.metadata.annotations ?? {},
      metadata_labels: this.metadata.labels ?? {},
      status: this.status,
      state: this.state,
      spec: this.spec,
      revision_id: uuid(),
      revision_at: new Date().toISOString(),
      revision_by: actor.metadata.name,
      revision_message: message,
      revision_parent: parent_revision,
    };
  }
}

export class NamespacedUpdateResource {
  metadata: NamespacedMeta;
  spec: Record<string, any>;
  status: Record<string, any>;
  state: string;
  history: Pick<History, 'id'>;

  constructor(partial: NonMethodFields<NamespacedUpdateResource>) {
    this.metadata = new NamespacedMeta(partial.metadata);
    this.spec = partial.spec;
    this.status = partial.status;
    this.state = partial.state;
    this.history = { id: partial.history.id };
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
    actor: Subject,
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
      revision_by: actor.metadata.name,
      revision_message: message,
      revision_parent: parent_revision,
    };
  }
}
