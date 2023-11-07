export class GlobalMeta {
  labels: Record<string, string>;

  constructor(partial: GlobalMeta) {
    this.labels = partial.labels;
  }
}

export class UpdateGlobalMeta extends GlobalMeta {
  rev?: string;

  constructor(partial: UpdateGlobalMeta) {
    super(partial);
    this.rev = partial.rev;
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
  by: string;
  at: string;
  message: string;
  parent: string | null;

  constructor(partial: History) {
    Object.assign(this, partial);
  }

  static createID(name: string, rev: string, kind: string): string {
    return `hist/${name}/${rev}/${kind}`;
  }
}
