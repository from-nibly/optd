import {
  GlobalCreateResource,
  GlobalResource,
  GlobalUpdateResource,
} from 'src/resources/resources.types';
import { NonMethodFields } from 'src/types/types';
import { CreateKindAPIBody, UpdateKindAPIBody } from './kinds.types.api';
import { KindDBRecord } from './kinds.types.record';

export class KindHookSpec {
  validate?: string;
  preCreate?: string;
  postCreate?: string;
  preUpdate?: string;
  postUpdate?: string;
  preDelete?: string;
  postDelete?: string;

  constructor(obj: KindHookSpec) {
    Object.assign(this, obj);
  }
}

export class KindSpec {
  hooks: KindHookSpec;
  is_meta: boolean;

  constructor(obj: Partial<KindSpec>) {
    //TODO better validation?
    this.hooks = obj.hooks ?? {};
    this.is_meta = obj.is_meta ?? false;
  }
}

export class Kind extends GlobalResource {
  spec: KindSpec;

  constructor(obj: NonMethodFields<Kind>) {
    super(obj);
    this.spec = new KindSpec(obj.spec);
  }

  static fromDBRecord(record: KindDBRecord): Kind {
    return GlobalResource.fromDBRecord(record, Kind.kind, Kind);
  }

  static get kind(): 'kind' {
    return 'kind';
  }
}

export class CreateKind extends GlobalCreateResource {
  spec: KindSpec;

  constructor(obj: NonMethodFields<CreateKind>) {
    super(obj);
    this.spec = new KindSpec(obj.spec ?? {});
  }

  static fromAPIRequest(request: CreateKindAPIBody, name: string): CreateKind {
    return GlobalCreateResource.fromAPIRequest(
      request,
      name,
      Kind.kind,
      CreateKind,
    );
  }
}

export class UpdateKind extends GlobalUpdateResource {
  spec: KindSpec;

  constructor(obj: NonMethodFields<UpdateKind>) {
    super(obj);
    this.spec = new KindSpec(obj.spec);
  }

  static fromAPIRequest(request: UpdateKindAPIBody, name: string): UpdateKind {
    return GlobalUpdateResource.fromAPIRequest(
      request,
      name,
      Kind.kind,
      UpdateKind,
    );
  }
}
