import { GlobalResourceDBRecord } from 'src/resources/resources.types.record';
import { GroupSpec } from './groups.types';

export interface GroupDBRecord extends GlobalResourceDBRecord {
  spec: GroupSpec;
}
