import { GlobalMetaRecord } from './record.types';

export class GlobalMetaApiResponse<K extends string = string> {
  kind: K;
  name: string;
  labels: Record<string, string>;
  rev: string;

  constructor(partial: Partial<GlobalMetaApiResponse<K>>) {
    Object.assign(this, partial);
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

export class NamespacedMetaApiResponse<
  K extends string = string,
> extends GlobalMetaApiResponse<K> {
  namespace: string;

  constructor(partial: Partial<NamespacedMetaApiResponse<K>>) {
    super(partial);
    Object.assign(this, partial);
  }
}
