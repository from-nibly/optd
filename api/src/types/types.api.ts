import { GlobalMeta, NamespacedMeta } from './types';

export class GlobalMetaApiResponse<
  K extends string = string,
> extends GlobalMeta {
  kind: K;

  constructor(partial: GlobalMetaApiResponse<K>) {
    super(partial);
    this.kind = partial.kind;
  }

  static fromRecord<K extends string = string>(
    metadata: GlobalMeta,
    kind: K,
  ): GlobalMetaApiResponse<K> {
    return new GlobalMetaApiResponse({
      kind: kind,
      name: metadata.name,
      labels: metadata.labels,
      annotations: metadata.annotations,
    });
  }
}

export class PutGlobalMetaApiBody extends GlobalMeta {
  kind: string;
  constructor(partial: PutGlobalMetaApiBody) {
    super(partial);
    this.kind = partial.kind;
  }
}

export class UpdateGlobalMetaApiBody extends GlobalMeta {
  kind: string;

  constructor(partial: UpdateGlobalMetaApiBody) {
    super(partial);
  }
}

export class NamespacedMetaApiResponse<
  K extends string = string,
> extends GlobalMetaApiResponse<K> {
  namespace: string;

  constructor(partial: NamespacedMetaApiResponse<K>) {
    super(partial);
    this.namespace = partial.namespace;
  }

  static fromRecord<K extends string = string>(
    metadata: NamespacedMeta,
    kind: K,
  ): NamespacedMetaApiResponse<K> {
    return new NamespacedMetaApiResponse({
      kind: kind,
      name: metadata.name,
      labels: metadata.labels,
      annotations: metadata.annotations,
      namespace: metadata.namespace,
    });
  }
}
