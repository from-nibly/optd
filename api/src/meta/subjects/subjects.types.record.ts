import { GlobalResourceDBRecord } from 'src/resources/resources.types.record';
import { SubjectSpec } from './subjects.types';

export interface SubjectDBRecord extends GlobalResourceDBRecord {
  spec: SubjectSpec;
}
