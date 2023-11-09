import { Resource } from 'src/resources/resources.types';
import { Exclude } from 'class-transformer';

export class SubjectSpec {
  @Exclude()
  passwordHash?: string;

  constructor(partial: SubjectSpec) {
    this.passwordHash = partial.passwordHash;
  }
}

export class Subject extends Resource {
  spec: SubjectSpec;

  constructor(partial: Subject) {
    super(partial);
    this.spec = new SubjectSpec(partial.spec);
  }
}
