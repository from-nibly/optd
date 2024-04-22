import { GlobalMeta, NamespacedMeta } from './types';

export class GlobalMetaAPIResponse<
  K extends string = string,
> extends GlobalMeta {
  kind: K;

  constructor(partial: GlobalMetaAPIResponse<K>) {
    super(partial);
    this.kind = partial.kind;
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
  constructor(partial: GlobalCreateMetaApiBody) {
    super(partial);
    this.kind = partial.kind;
  }
}

export class GlobalUpdateMetaApiBody extends GlobalMeta {
  kind: string;

  constructor(partial: GlobalUpdateMetaApiBody) {
    super(partial);
  }
}

export class NamespacedMetaAPIResponse<
  K extends string = string,
> extends GlobalMetaAPIResponse<K> {
  namespace: string;

  constructor(partial: NamespacedMetaAPIResponse<K>) {
    super(partial);
    this.namespace = partial.namespace;
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

  constructor(partial: NamespacedCreateMetaApiBody) {
    super(partial);
    this.namespace = partial.namespace;
  }
}

export class NamespacedUpdateMetaApiBody extends GlobalUpdateMetaApiBody {
  namespace: string;

  constructor(partial: NamespacedUpdateMetaApiBody) {
    super(partial);
    this.namespace = partial.namespace;
  }
}
