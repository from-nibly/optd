import { NamespacedResourceDBRecord } from 'src/resources/resources.types.record';
import { RoleSpec } from './roles.types';

export interface RoleDBRecord extends NamespacedResourceDBRecord {
  spec: RoleSpec;
}
