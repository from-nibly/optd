import { CreateResource, Resource } from 'src/resources/resources.types';
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

export class CreateSubjectRecord extends CreateResource {
  spec: SubjectSpec;

  constructor(partial: CreateSubjectRecord) {
    super(partial);
    this.spec = new SubjectSpec(partial.spec);
  }
}

export class UpdateSubjectRecord extends CreateResource {
  spec: SubjectSpec;

  constructor(partial: CreateSubjectRecord) {
    super(partial);
    this.spec = new SubjectSpec(partial.spec);
  }
}
