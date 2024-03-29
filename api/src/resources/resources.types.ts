import { GlobalMeta, History, NamespacedMeta } from 'src/types/types';
import { ResourceDBRecord } from './resources.types.record';

export class HookableResource {
  metadata: NamespacedMeta;
  spec: any;
  status: any;
  history?: History;

  constructor(partial: Resource) {
    this.metadata = new NamespacedMeta(partial.metadata);
    this.spec = partial.spec;
    this.status = partial.status;
    this.history = partial.history ? new History(partial.history) : undefined;
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
  }

  static fromDBRecord(record: ResourceDBRecord): Resource {
    return new Resource({
      metadata: {
        name: record.name,
        namespace: record.namespace,
        labels: record.metadata_labels,
        annotations: record.metadata_annotations,
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

export class UpdateResource {
  metadata: NamespacedMeta;
  spec: any;
  status: any;

  constructor(partial: UpdateResource) {
    this.metadata = new NamespacedMeta(partial.metadata);
    this.spec = partial.spec;
    this.status = partial.status;
  }
}

export class CreateResource {
  metadata: NamespacedMeta;
  spec: any;
  status: any;

  constructor(partial: CreateResource) {
    this.metadata = new NamespacedMeta(partial.metadata);
    this.spec = partial.spec;
  }
}
