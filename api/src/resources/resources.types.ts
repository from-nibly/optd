import {
  CreateNamespacedMeta,
  History,
  NamespacedMeta,
  NonMethodFields,
  UserContext,
} from 'src/types/types';
import { ResourceDBRecord } from './resources.types.record';
import {
  CreateResourceAPIBody,
  UpdateResourceAPIBody,
} from './resources.types.api';
import { v4 as uuid } from 'uuid';

export class HookableResource {
  metadata: NamespacedMeta;
  spec: any;
  status: any;
  history?: History;
  state: string;

  constructor(partial: Resource) {
    this.metadata = new NamespacedMeta(partial.metadata);
    this.spec = partial.spec;
    this.status = partial.status;
    this.history = partial.history ? new History(partial.history) : undefined;
    this.state = partial.state;
  }
}

export class Resource {
  metadata: NamespacedMeta;
  spec: any;
  status: any;
  history: History;
  state: string;

  constructor(partial: Resource) {
    this.metadata = new NamespacedMeta(partial.metadata);
    this.spec = partial.spec;
    this.status = partial.status;
    this.history = new History(partial.history);
    this.state = partial.state;
  }

  static fromDBRecord(kind: string, record: ResourceDBRecord): Resource {
    return new Resource({
      metadata: {
        name: record.name,
        namespace: record.namespace,
        labels: record.metadata_labels,
        annotations: record.metadata_annotations,
        kind: kind,
      },
      history: {
        id: record.revision_id,
        by: record.revision_by,
        at: record.revision_at,
        message: record.revision_message,
        parent: record.revision_parent,
      },
      spec: record.spec,
      status: record.status,
      state: record.state,
    });
  }
}

export class CreateResource {
  metadata: CreateNamespacedMeta;
  spec: Record<string, any>;

  constructor(partial: NonMethodFields<CreateResource>) {
    this.metadata = new CreateNamespacedMeta(partial.metadata);
    this.spec = partial.spec;
  }

  static fromAPIRequest(
    request: CreateResourceAPIBody,
    kind: string,
    namespace: string,
    name: string,
  ): CreateResource {
    console.log('request', request, kind);
    return new CreateResource({
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

  toDBRecord(actor: UserContext, message: string): ResourceDBRecord {
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
      revision_by: actor.username,
      revision_message: message,
      revision_parent: null,
    };
  }
}

export class UpdateResource {
  metadata: NamespacedMeta;
  spec: Record<string, any>;
  status: Record<string, any>;
  state: string;
  history: Pick<History, 'id'>;

  constructor(partial: NonMethodFields<UpdateResource>) {
    this.metadata = new NamespacedMeta(partial.metadata);
    this.spec = partial.spec;
    this.status = partial.status;
    this.state = partial.state;
    this.history = { id: partial.history.id };
  }

  static fromAPIRequest(
    request: UpdateResourceAPIBody,
    namespace: string,
    name: string,
  ): UpdateResource {
    return new UpdateResource({
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
    actor: UserContext,
    parent_revision: string,
    message: string,
  ): ResourceDBRecord {
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
      revision_by: actor.username,
      revision_message: message,
      revision_parent: parent_revision,
    };
  }
}
