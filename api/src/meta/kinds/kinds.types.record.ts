import { GlobalDBRecord } from 'src/types/types.record';
import { KindSpec } from './kinds.types';

export interface KindDBRecord extends GlobalDBRecord {
  spec: KindSpec;
  is_meta: boolean;
}
