import { History, NonMethodFields } from 'src/types/types';
import {
  GlobalCreateMetaApiBody,
  GlobalMetaAPIResponse,
  NamespacedCreateMetaApiBody,
  NamespacedMetaAPIResponse,
  NamespacedUpdateMetaApiBody,
} from 'src/types/types.api';
import { GlobalResource, NamespacedResource } from './resources.types';

export class GlobalResourceAPIResponse {
  metadata: GlobalMetaAPIResponse;
  spec: any;
  status: any;
  history: History;
  state: string;

  constructor(obj: NonMethodFields<GlobalResourceAPIResponse>) {
    this.metadata = new GlobalMetaAPIResponse(obj.metadata);
    this.spec = obj.spec;
    this.status = obj.status;
    this.history = obj.history;
    this.state = obj.state;
  }

  static fromRecord(
    record: GlobalResource,
    kind: string,
  ): GlobalResourceAPIResponse {
    return new GlobalResourceAPIResponse({
      metadata: GlobalMetaAPIResponse.fromRecord(record.metadata, kind),
      spec: record.spec,
      status: record.status,
      history: record.history,
      state: record.state,
    });
  }
}

export class NamespacedResourceAPIResponse {
  metadata: NamespacedMetaAPIResponse;
  spec: any;
  status: any;
  history: History;
  state: string;

  constructor(obj: NonMethodFields<NamespacedResourceAPIResponse>) {
    this.metadata = new NamespacedMetaAPIResponse(obj.metadata);
    this.spec = obj.spec;
    this.status = obj.status;
    this.history = obj.history;
    this.state = obj.state;
  }

  static fromRecord(
    record: NamespacedResource,
    kind: string,
  ): NamespacedResourceAPIResponse {
    return new NamespacedResourceAPIResponse({
      metadata: NamespacedMetaAPIResponse.fromRecord(record.metadata, kind),
      spec: record.spec,
      status: record.status,
      history: record.history,
      state: record.state,
    });
  }
}

export class GlobalCreateResourceAPIBody {
  metadata: GlobalCreateMetaApiBody;
  spec: any;

  constructor(obj: NonMethodFields<GlobalCreateResourceAPIBody>) {
    this.metadata = new GlobalCreateMetaApiBody(obj.metadata);
    this.spec = obj.spec;
  }
}

export class NamespacedCreateResourceAPIBody {
  metadata: NamespacedCreateMetaApiBody;
  spec: any;
  status: any;
  state: string;
}

export class GlobalUpdateResourceAPIBody {
  metadata: GlobalMetaAPIResponse;
  spec: any;
  status: any;
  state: string;
  history: Pick<History, 'id'>;

  constructor(obj: NonMethodFields<GlobalUpdateResourceAPIBody>) {
    this.metadata = new GlobalMetaAPIResponse(obj.metadata);
    this.spec = obj.spec;
    this.status = obj.status;
    this.state = obj.state;
    this.history = { id: obj.history.id };
  }

  static isUpdateResourceAPIBody(
    body: any,
  ): body is GlobalUpdateResourceAPIBody {
    return body.history?.id !== undefined;
  }
}

export class NamespacedUpdateResourceAPIBody {
  metadata: NamespacedUpdateMetaApiBody;
  spec: any;
  status: any;
  state: string;
  history: Pick<History, 'id'>;

  constructor(obj: NamespacedUpdateResourceAPIBody) {
    this.metadata = new NamespacedUpdateMetaApiBody(obj.metadata);
    this.spec = obj.spec;
    this.status = obj.status;
    this.state = obj.state;
    this.history = { id: obj.history.id };
  }

  static isUpdateResourceAPIBody(
    body: any,
  ): body is NamespacedUpdateResourceAPIBody {
    return body.history?.id !== undefined;
  }
}
