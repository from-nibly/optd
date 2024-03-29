import { ResourceDBRecord } from 'src/resources/resources.types.record';
import { SubjectSpec } from './subjects.types';

export interface SubjectRecord extends ResourceDBRecord {
  spec: SubjectSpec;
}
