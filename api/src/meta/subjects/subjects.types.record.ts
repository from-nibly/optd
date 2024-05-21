import { NamespacedResourceDBRecord } from 'src/resources/resources.types.record';
import { SubjectSpec } from './subjects.types';

export interface SubjectDBRecord extends NamespacedResourceDBRecord {
  spec: SubjectSpec;
}
