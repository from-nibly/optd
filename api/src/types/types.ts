export class GlobalMeta {
  name: string;
  labels: Record<string, string>;
  annotations: Record<string, string>;

  constructor(obj: GlobalMeta) {
    this.labels = obj.labels;
    this.name = obj.name;
    this.annotations = obj.annotations;
  }
}

export class NamespacedMeta extends GlobalMeta {
  namespace: string;

  constructor(partial: NamespacedMeta) {
    super(partial);
    this.namespace = partial.namespace;
  }
}

export class History {
  id: string;
  by: string;
  at: string;
  message?: string;
  parent: string | null;

  constructor(partial: History) {
    Object.assign(this, partial);
  }
}

export class GlobalRecord {
  metadata: GlobalMeta;
  spec: any;
  status: any;
  state: string;
  history: History;

  constructor(obj: GlobalRecord) {
    this.metadata = new GlobalMeta(obj.metadata);
    this.spec = obj.spec;
    this.status = obj.status;
    this.state = obj.state;
    this.history = new History(obj.history);
  }
}

export class NamespacedRecord {
  metadata: NamespacedMeta;
  spec: any;
  status: any;
  state: string;
  history: History;

  constructor(obj: NamespacedRecord) {
    this.metadata = obj.metadata;
    this.spec = obj.spec;
    this.status = obj.status;
    this.state = obj.state;
    this.history = obj.history;
  }
}
