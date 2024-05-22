import {
  GlobalCreateResource,
  GlobalResource,
  GlobalUpdateResource,
} from 'src/resources/resources.types';
import { ActorContext, NonMethodFields } from 'src/types/types';
import {
  CreateSubjectAPIBody,
  UpdateSubjectAPIBody,
} from './subjects.types.api';
import { SubjectDBRecord } from './subjects.types.record';

export class SubjectSpec {
  passwordHash?: string;

  constructor(obj: SubjectSpec) {
    this.passwordHash = obj.passwordHash;
  }
}

export class Subject extends GlobalResource {
  spec: SubjectSpec;

  constructor(obj: Subject) {
    super(obj);
    this.spec = new SubjectSpec(obj.spec);
  }

  static get kind(): 'subjects' {
    return 'subjects';
  }

  static fromDBRecord(record: SubjectDBRecord): Subject {
    return GlobalResource.fromDBRecord(record, Subject.kind, Subject);
  }
}

export class CreateSubject extends GlobalCreateResource {
  spec: SubjectSpec;

  constructor(obj: NonMethodFields<CreateSubject>) {
    super(obj);
    this.spec = new SubjectSpec(obj.spec);
  }

  static fromAPIRequest(
    request: CreateSubjectAPIBody,
    name: string,
  ): CreateSubject {
    return GlobalCreateResource.fromAPIRequest<CreateSubjectAPIBody>(
      request,
      name,
      Subject.kind,
      CreateSubject,
    );
  }
}

export class UpdateSubject extends GlobalUpdateResource {
  spec: SubjectSpec;

  constructor(obj: NonMethodFields<UpdateSubject>) {
    super(obj);
    this.spec = new SubjectSpec(obj.spec);
  }

  static fromAPIRequest(
    request: UpdateSubjectAPIBody,
    name: string,
  ): UpdateSubject {
    return GlobalUpdateResource.fromAPIRequest(
      request,
      name,
      Subject.kind,
      UpdateSubject,
    );
  }
}
