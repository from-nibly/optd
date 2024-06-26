import { Action, Permission, Role } from 'src/meta/roles/roles.types';
import { Subject } from 'src/meta/subjects/subjects.types';

type NonMethodKeys<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
export type NonMethodFields<T> = Pick<T, NonMethodKeys<T>>;

export class GlobalMeta {
  name: string;
  labels: Record<string, string>;
  annotations: Record<string, string>;
  kind: string;

  constructor(obj: GlobalMeta) {
    this.name = obj.name;
    this.labels = obj.labels;
    this.annotations = obj.annotations;
    this.kind = obj.kind;
  }
}

export class GlobalCreateMeta {
  name: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  kind: string;

  constructor(obj: NonMethodFields<GlobalCreateMeta>) {
    this.name = obj.name;
    this.labels = obj.labels;
    this.annotations = obj.annotations;
    this.kind = obj.kind;
  }
}

export class NamespacedMeta extends GlobalMeta {
  namespace: string;

  constructor(obj: NonMethodFields<NamespacedMeta>) {
    super(obj);
    this.namespace = obj.namespace;
  }
}

export class NamespacedCreateMeta extends GlobalCreateMeta {
  namespace: string;

  constructor(obj: NamespacedCreateMeta) {
    super(obj);
    this.namespace = obj.namespace;
  }
}

export class History {
  id: string;
  by: string;
  at: Date;
  message?: string;
  parent: string | null;

  constructor(obj: NonMethodFields<Exclude<History, 'at'>>) {
    this.id = obj.id;
    this.by = obj.by;
    this.at = obj.at;
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

export class GlobalCreateRecord {
  metadata: GlobalCreateMeta;
  spec?: any;
  status?: any;
  state: 'pending';

  constructor(obj: GlobalCreateRecord) {
    this.metadata = new GlobalCreateMeta(obj.metadata);
    this.spec = obj.spec;
    this.status = obj.status;
    this.state = obj.state;
  }
}

export class GlobalUpdateRecord {
  metadata: GlobalCreateMeta;
  spec?: any;
  status?: any;
  state: string;
  history: Pick<History, 'id'>;

  constructor(obj: GlobalUpdateRecord) {
    this.metadata = new GlobalCreateMeta(obj.metadata);
    this.spec = obj.spec;
    this.status = obj.status;
    this.state = obj.state;
    this.history = { id: obj.history.id };
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

export class ActorContext {
  subject: Subject;
  roles: Role[];

  constructor(subject: Subject) {
    this.subject = subject;
  }

  getPermissionPaths(action: Action): string[] {
    return this.roles
      .map((r) => r.spec.permissions)
      .flat()
      .filter((p) => p.actions.includes(action))
      .map((p) => p.path);
  }
}
