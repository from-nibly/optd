import { GlobalResourceDBRecord } from 'src/resources/resources.types.record';
import { RoleSpec } from './roles.types';

export interface RoleDBRecord extends GlobalResourceDBRecord {
  spec: RoleSpec;
}
