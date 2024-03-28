type NonMethodKeys<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
export type NonMethodFields<T> = Pick<T, NonMethodKeys<T>>;

export class GlobalMeta {
  name: string;
  labels: Record<string, string>;
  annotations: Record<string, string>;

  constructor(obj: GlobalMeta) {
    this.name = obj.name;
    this.labels = obj.labels;
    this.annotations = obj.annotations;
  }
}

export class CreateGlobalMeta {
  name: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;

  constructor(partial: CreateGlobalMeta) {
    this.name = partial.name;
    this.labels = partial.labels;
    this.annotations = partial.annotations;
  }
}

export class NamespacedMeta extends GlobalMeta {
  namespace: string;

  constructor(partial: NonMethodFields<NamespacedMeta>) {
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

  constructor(obj: NonMethodFields<Exclude<History, 'at'>>) {
    this.id = obj.id;
    this.by = obj.by;
    this.message = obj.message;
    this.parent = obj.parent;
  }
}

export class GlobalRecord {
  metadata: GlobalMeta;
  spec: any;
  status: any;
  state: string;
  history: History;

  constructor(obj: NonMethodFields<GlobalRecord>) {
    this.metadata = new GlobalMeta(obj.metadata);
    this.spec = obj.spec;
    this.status = obj.status;
    this.state = obj.state;
    this.history = new History(obj.history);
  }
}

export class CreateGlobalRecord {
  metadata: CreateGlobalMeta;
  spec?: any;
  status?: any;
  state: 'pending';

  constructor(partial: CreateGlobalRecord) {
    this.metadata = new CreateGlobalMeta(partial.metadata);
    this.spec = partial.spec;
    this.status = partial.status;
    this.state = partial.state;
  }
}

export class NamespacedRecord {
  metadata: NamespacedMeta;
  spec: any;
  status: any;
  state: string;
  history: History;

  constructor(obj: NonMethodFields<NamespacedRecord>) {
    this.metadata = obj.metadata;
    this.spec = obj.spec;
    this.status = obj.status;
    this.state = obj.state;
    this.history = obj.history;
  }
}

export class UserContext {
  username: string;

  constructor(username: string) {
    this.username = username;
  }
}
