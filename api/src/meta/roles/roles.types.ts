import {
  GlobalCreateResource,
  GlobalResource,
  GlobalUpdateResource,
} from 'src/resources/resources.types';
import { CreateRoleAPIBody, UpdateRoleAPIBody } from './roles.types.api';
import { NonMethodFields } from 'src/types/types';
import { RoleDBRecord } from './roles.types.record';

export type Action =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'list'
  | 'patch'
  | 'history';

export class Permission {
  actions: Action[];
  path: string;

  constructor(obj: Permission) {
    this.actions = obj.actions;
    this.path = obj.path;
  }
}

export class RoleSpec {
  constructor(obj: RoleSpec) {
    this.permissions = obj.permissions;
  }
  permissions: Permission[];
}

export class Role extends GlobalResource {
  spec: RoleSpec;

  constructor(obj: Role) {
    super(obj);
    this.spec = new RoleSpec(obj.spec);
  }

  static get kind(): 'roles' {
    return 'roles';
  }

  static fromDBRecord(record: RoleDBRecord) {
    return GlobalResource.fromDBRecord(record, 'role', Role);
  }
}

export class CreateRole extends GlobalCreateResource {
  spec: RoleSpec;

  constructor(obj: NonMethodFields<CreateRole>) {
    super(obj);
    this.spec = new RoleSpec(obj.spec);
  }

  static fromAPIRequest(request: CreateRoleAPIBody, name: string): CreateRole {
    return GlobalCreateResource.fromAPIRequest<CreateRoleAPIBody>(
      request,
      name,
      Role.kind,
      CreateRole,
    );
  }
}

export class UpdateRole extends GlobalUpdateResource {
  spec: RoleSpec;

  constructor(obj: NonMethodFields<UpdateRole>) {
    super(obj);
    this.spec = new RoleSpec(obj.spec);
  }

  static fromAPIRequest(request: UpdateRoleAPIBody, name: string): UpdateRole {
    return GlobalUpdateResource.fromAPIRequest(
      request,
      name,
      Role.kind,
      UpdateRole,
    );
  }
}
