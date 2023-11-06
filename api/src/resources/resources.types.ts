import { GlobalMeta, History } from 'src/types/types';

export class Resource {
  metadata: GlobalMeta;
  spec: any;
  status: any;
  history: History;

  constructor(partial: Resource) {
    this.metadata = new GlobalMeta(partial.metadata);
    this.spec = partial.spec;
    this.status = partial.status;
    this.history = new History(partial.history);
  }
}
