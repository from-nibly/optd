import { NamespacedResourceDBRecord } from 'src/resources/resources.types.record';
import { GroupSpec } from './groups.types';

export interface GroupDBRecord extends NamespacedResourceDBRecord {
  spec: GroupSpec;
}
