import {
  GlobalCreateResource,
  GlobalResource,
  GlobalUpdateResource,
} from 'src/resources/resources.types';
import { CreateGroupAPIBody, UpdateGroupAPIBody } from './groups.types.api';
import { NonMethodFields } from 'src/types/types';
import { GroupDBRecord } from './groups.types.record';

export class GroupSpec {
  constructor(obj: GroupSpec) {
    this.roles = obj.roles;
    this.subjects = obj.subjects;
  }
  roles: string[];
  subjects: string[];
}

export class Group extends GlobalResource {
  spec: GroupSpec;

  constructor(obj: Group) {
    super(obj);
    this.spec = new GroupSpec(obj.spec);
  }

  static get kind(): 'groups' {
    return 'groups';
  }

  static fromDBRecord(record: GroupDBRecord) {
    return GlobalResource.fromDBRecord(record, Group.kind, Group);
  }
}

export class CreateGroup extends GlobalCreateResource {
  spec: GroupSpec;

  constructor(obj: NonMethodFields<CreateGroup>) {
    super(obj);
    this.spec = new GroupSpec(obj.spec);
  }

  static fromAPIRequest(
    request: CreateGroupAPIBody,
    name: string,
  ): CreateGroup {
    return GlobalCreateResource.fromAPIRequest<CreateGroupAPIBody>(
      request,
      name,
      Group.kind,
      CreateGroup,
    );
  }
}

export class UpdateGroup extends GlobalUpdateResource {
  spec: GroupSpec;

  constructor(obj: NonMethodFields<UpdateGroup>) {
    super(obj);
    this.spec = new GroupSpec(obj.spec);
  }

  static fromAPIRequest(
    request: UpdateGroupAPIBody,
    name: string,
  ): UpdateGroup {
    return GlobalUpdateResource.fromAPIRequest(
      request,
      name,
      Group.kind,
      UpdateGroup,
    );
  }
}
