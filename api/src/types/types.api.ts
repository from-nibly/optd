import { GlobalMeta } from './types';
import { GlobalMetaRecord } from './types.record';

export class GlobalMetaApiResponse<
  K extends string = string,
> extends GlobalMeta {
  kind: K;
  name: string;
  rev: string;

  constructor(partial: GlobalMetaApiResponse<K>) {
    super(partial);
    this.kind = partial.kind;
    this.name = partial.name;
    this.rev = partial.rev;
  }

  static fromRecord<K extends string = string>(
    record: GlobalMetaRecord,
    kind: K,
    name: string,
    rev: string,
  ): GlobalMetaApiResponse<K> {
    return new GlobalMetaApiResponse({
      kind: kind,
      name: name,
      labels: record.labels,
      rev: rev,
    });
  }
}

export class PutGlobalMetaApiBody extends GlobalMeta {
  rev?: string;

  constructor(partial: PutGlobalMetaApiBody) {
    super(partial);
    this.rev = partial.rev;
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
