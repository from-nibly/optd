import {
  GlobalCreateResource,
  GlobalResource,
  GlobalUpdateResource,
} from 'src/resources/resources.types';
import { NonMethodFields } from 'src/types/types';
import { CreateMetaAPIBody, UpdateMetaAPIBody } from './meta.types.api';
import { MetaDBRecord } from './meta.types.record';
import { SubjectSpec } from './subjects/subjects.types';
import { GroupSpec } from './groups/groups.types';
import { RoleSpec } from './roles/roles.types';

type Constructor = new (obj: any) => any;

const spl: Record<string, Constructor> = {
  subjects: SubjectSpec,
  groups: GroupSpec,
  roles: RoleSpec,
};

export class Meta extends GlobalResource {
  spec: any;

  constructor(obj: NonMethodFields<Meta>) {
    super(obj);
    this.spec = new spl[obj.metadata.kind](obj.spec);
  }

  static fromDBRecord(record: MetaDBRecord, kind: string): Meta {
    return GlobalResource.fromDBRecord(record, kind, Meta);
  }
}

export class CreateMeta extends GlobalCreateResource {
  spec: any;

  constructor(obj: NonMethodFields<CreateMeta>) {
    super(obj);
    this.spec = new spl[obj.metadata.kind](obj.spec ?? {});
  }

  static fromAPIRequest(
    request: CreateMetaAPIBody,
    name: string,
    kind: string,
  ): CreateMeta {
    return GlobalCreateResource.fromAPIRequest<CreateMetaAPIBody>(
      request,
      name,
      kind,
      CreateMeta,
    );
  }
}

export class UpdateMeta extends GlobalUpdateResource {
  spec: any;

  constructor(obj: NonMethodFields<UpdateMeta>) {
    super(obj);
    this.spec = new spl[obj.metadata.kind](obj.spec);
  }

  static fromAPIRequest(
    request: UpdateMetaAPIBody,
    name: string,
    kind: string,
  ): UpdateMeta {
    return GlobalUpdateResource.fromAPIRequest(request, name, kind, UpdateMeta);
  }
}
