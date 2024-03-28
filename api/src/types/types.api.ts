import { GlobalMeta } from './types';

export class GlobalMetaApiResponse<
  K extends string = string,
> extends GlobalMeta {
  kind: K;

  constructor(partial: GlobalMetaApiResponse<K>) {
    super(partial);
    this.kind = partial.kind;
    this.name = partial.name;
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
  rev: string;

  constructor(partial: UpdateGlobalMetaApiBody) {
    super(partial);
    this.rev = partial.rev;
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
}
