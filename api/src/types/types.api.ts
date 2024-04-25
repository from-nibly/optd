import { GlobalMeta, NamespacedMeta } from './types';

export class GlobalMetaAPIResponse<
  K extends string = string,
> extends GlobalMeta {
  kind: K;

  constructor(obj: GlobalMetaAPIResponse<K>) {
    super(obj);
    this.kind = obj.kind;
  }

  static fromRecord<K extends string = string>(
    metadata: GlobalMeta,
    kind: K,
  ): GlobalMetaAPIResponse<K> {
    return new GlobalMetaAPIResponse({
      kind: kind,
      name: metadata.name,
      labels: metadata.labels,
      annotations: metadata.annotations,
    });
  }
}

export class GlobalCreateMetaApiBody extends GlobalMeta {
  kind: string;
  constructor(obj: GlobalCreateMetaApiBody) {
    super(obj);
    this.kind = obj.kind;
  }
}

export class GlobalUpdateMetaApiBody extends GlobalMeta {
  kind: string;

  constructor(obj: GlobalUpdateMetaApiBody) {
    super(obj);
  }
}

export class NamespacedMetaAPIResponse<
  K extends string = string,
> extends GlobalMetaAPIResponse<K> {
  namespace: string;

  constructor(obj: NamespacedMetaAPIResponse<K>) {
    super(obj);
    this.namespace = obj.namespace;
  }

  static fromRecord<K extends string = string>(
    metadata: NamespacedMeta,
    kind: K,
  ): NamespacedMetaAPIResponse<K> {
    return new NamespacedMetaAPIResponse({
      kind: kind,
      name: metadata.name,
      labels: metadata.labels,
      annotations: metadata.annotations,
      namespace: metadata.namespace,
    });
  }
}

export class NamespacedCreateMetaApiBody extends GlobalCreateMetaApiBody {
  namespace: string;

  constructor(obj: NamespacedCreateMetaApiBody) {
    super(obj);
    this.namespace = obj.namespace;
  }
}

export class NamespacedUpdateMetaApiBody extends GlobalUpdateMetaApiBody {
  namespace: string;

  constructor(obj: NamespacedUpdateMetaApiBody) {
    super(obj);
    this.namespace = obj.namespace;
  }
}
