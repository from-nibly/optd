export class GlobalMetaRecord {
  labels: Record<string, string>;

  constructor(partial: Partial<GlobalMetaRecord>) {
    Object.assign(this, partial);
  }
}

export class NamespacedMetaRecord extends GlobalMetaRecord {}

export class HistoryRecord {
  by: string;
  at: string;
  message: string;
  parent: string | null;

  constructor(partial: Partial<HistoryRecord>) {
    Object.assign(this, partial);
  }
}
