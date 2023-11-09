import { ResourceRecord } from 'src/resources/resources.types.record';
import { SubjectSpec } from './subjects.types';

export class SubjectRecord extends ResourceRecord {
  spec: SubjectSpec;
}
