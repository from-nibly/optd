import { GlobalMeta, History, UpdateGlobalMeta } from 'src/types/types';

export class KindHookSpec {
  postCreate?: string;
  validate?: string;
  postUpdate?: string;
  preUpdate?: string;

  constructor(partial: KindHookSpec) {
    Object.assign(this, partial);
  }
}

export class KindSpec {
  hooks: KindHookSpec;

  constructor(partial: KindSpec) {
    Object.assign(this, partial);
  }
}

export class Kind {
  metadata: GlobalMeta;
  spec: KindSpec;
  status: any;
  history: History;

  constructor(partial: Kind) {
    Object.assign(this, partial);
  }
}

export class CreateKind {
  metadata: GlobalMeta;
  spec: KindSpec;

  constructor(partial: CreateKind) {
    this.metadata = new GlobalMeta(partial.metadata);
    this.spec = new KindSpec(partial.spec);
  }
}

export class UpdateKind {
  metadata: UpdateGlobalMeta;
  spec: KindSpec;
  status: any;

  constructor(partial: UpdateKind) {
    this.metadata = new UpdateGlobalMeta(partial.metadata);
    this.spec = new KindSpec(partial.spec);
    this.status = partial.status;
  }
}
