import { GlobalMeta, History } from 'src/types/types';

export class HookableResource {
  metadata: GlobalMeta;
  spec: any;
  status: any;
  history?: History;

  constructor(partial: Resource) {
    this.metadata = new GlobalMeta(partial.metadata);
    this.spec = partial.spec;
    this.status = partial.status;
    this.history = partial.history ? new History(partial.history) : undefined;
  }
}

export class Resource {
  metadata: GlobalMeta;
  spec: any;
  status: any;
  history: History;

  constructor(partial: Resource) {
    this.metadata = new GlobalMeta(partial.metadata);
    this.spec = partial.spec;
    this.status = partial.status;
    this.history = new History(partial.history);
  }
}

export class UpdateResource {
  metadata: GlobalMeta;
  spec: any;
  status: any;

  constructor(partial: UpdateResource) {
    this.metadata = new GlobalMeta(partial.metadata);
    this.spec = partial.spec;
    this.status = partial.status;
  }
}

export class CreateResource {
  metadata: GlobalMeta;
  spec: any;
  status: any;

  constructor(partial: CreateResource) {
    this.metadata = new GlobalMeta(partial.metadata);
    this.spec = partial.spec;
  }
}
