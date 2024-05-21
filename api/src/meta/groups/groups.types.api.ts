import { History } from 'src/types/types';
import {
  GlobalCreateMetaApiBody,
  GlobalMetaAPIResponse,
} from 'src/types/types.api';
import { Group, GroupSpec } from './groups.types';
import {
  GlobalCreateResourceAPIBody,
  GlobalResourceAPIResponse,
  GlobalUpdateResourceAPIBody,
} from 'src/resources/resources.types.api';

export class GroupAPIResponse extends GlobalResourceAPIResponse {
  metadata: GlobalMetaAPIResponse;
  spec: GroupSpec;
  status: any;
  history: History;
  state: string;

  constructor(obj: GroupAPIResponse) {
    super(obj);
    this.spec = new GroupSpec(obj.spec);
  }

  static fromRecord(record: Group, kind: string = 'group'): GroupAPIResponse {
    return new GroupAPIResponse({
      metadata: GlobalMetaAPIResponse.fromRecord(record.metadata, kind),
      spec: new GroupSpec(record.spec),
      status: record.status,
      history: record.history,
      state: record.state,
    });
  }
}

export class CreateGroupAPIBody extends GlobalCreateResourceAPIBody {
  metadata: GlobalCreateMetaApiBody;
  spec: any;
}

export class UpdateGroupAPIBody extends GlobalUpdateResourceAPIBody {
  metadata: GlobalCreateMetaApiBody;
  spec: any;
  status: any;
  state: string;
  history: Pick<History, 'id'>;

  constructor(obj: UpdateGroupAPIBody) {
    super(obj);
    this.spec = new GroupSpec(obj.spec);
  }

  static isUpdateGroupAPIBody(body: any): body is UpdateGroupAPIBody {
    return body.history?.id !== undefined;
  }
}
