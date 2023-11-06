import { GlobalMeta } from './types';

export class GlobalMetaRecord extends GlobalMeta {
  constructor(partial: GlobalMetaRecord) {
    super(partial);
  }
}
