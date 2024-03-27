import { DBRecord } from 'src/types/types.record';
import { KindSpec } from './kinds.types';

export interface KindDBRecord extends DBRecord {
  spec: KindSpec;
}
