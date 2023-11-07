import { GlobalMeta, NamespacedMeta } from './types';

export interface Record {
  _rev: string;
  _id: string;
}

export class GlobalMetaRecord extends GlobalMeta {
  constructor(partial: GlobalMetaRecord) {
    super(partial);
  }
}
