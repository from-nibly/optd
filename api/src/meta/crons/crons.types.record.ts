import { GlobalResourceDBRecord } from 'src/resources/resources.types.record';
import { CronSpec } from './crons.types';

export interface CronDBRecord extends GlobalResourceDBRecord {
  spec: CronSpec;
}
