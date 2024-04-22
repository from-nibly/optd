import { Exclude } from 'class-transformer';
import {
  GlobalCreateResource,
  GlobalResource,
  GlobalUpdateResource,
} from 'src/resources/resources.types';
import {
  CreateSubjectAPIBody,
  UpdateSubjectAPIBody,
} from './subjects.types.api';
import { NonMethodFields } from 'src/types/types';
import { SubjectDBRecord } from './subjects.types.record';

export class SubjectSpec {
  @Exclude()
  passwordHash?: string;

  constructor(partial: SubjectSpec) {
    this.passwordHash = partial.passwordHash;
  }
}

export class Subject extends GlobalResource {
  spec: SubjectSpec;

  constructor(partial: Subject) {
    super(partial);
    this.spec = new SubjectSpec(partial.spec);
  }

  static fromDBRecord(record: SubjectDBRecord) {
    return GlobalResource.fromDBRecord(record, 'subject', Subject);
  }
}

export class CreateSubject extends GlobalCreateResource {
  spec: SubjectSpec;

  constructor(partial: NonMethodFields<CreateSubject>) {
    super(partial);
    this.spec = new SubjectSpec(partial.spec);
  }

  static fromAPIRequest(
    request: CreateSubjectAPIBody,
    name: string,
  ): CreateSubject {
    return GlobalCreateResource.fromAPIRequest<CreateSubjectAPIBody>(
      request,
      name,
      'subject',
      CreateSubject,
    );
  }
}

export class UpdateSubject extends GlobalUpdateResource {
  spec: SubjectSpec;

  constructor(partial: NonMethodFields<UpdateSubject>) {
    super(partial);
    this.spec = new SubjectSpec(partial.spec);
  }

  static fromAPIRequest(
    request: UpdateSubjectAPIBody,
    name: string,
  ): UpdateSubject {
    return GlobalUpdateResource.fromAPIRequest(
      request,
      name,
      'subject',
      UpdateSubject,
    );
  }
}
