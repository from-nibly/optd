import { History } from 'src/types/types';
import {
  GlobalCreateMetaApiBody,
  GlobalMetaAPIResponse,
} from 'src/types/types.api';
import { Role, RoleSpec } from './roles.types';
import {
  GlobalCreateResourceAPIBody,
  GlobalResourceAPIResponse,
  GlobalUpdateResourceAPIBody,
} from 'src/resources/resources.types.api';

export class RoleAPIResponse extends GlobalResourceAPIResponse {
  metadata: GlobalMetaAPIResponse;
  spec: RoleSpec;
  status: any;
  history: History;
  state: string;

  constructor(obj: RoleAPIResponse) {
    super(obj);
    this.spec = new RoleSpec(obj.spec);
  }

  static fromRecord(record: Role, kind: string = 'role'): RoleAPIResponse {
    return new RoleAPIResponse({
      metadata: GlobalMetaAPIResponse.fromRecord(record.metadata, kind),
      spec: new RoleSpec(record.spec),
      status: record.status,
      history: record.history,
      state: record.state,
    });
  }
}

export class CreateRoleAPIBody extends GlobalCreateResourceAPIBody {
  metadata: GlobalCreateMetaApiBody;
  spec: any;
}

export class UpdateRoleAPIBody extends GlobalUpdateResourceAPIBody {
  metadata: GlobalCreateMetaApiBody;
  spec: any;
  status: any;
  state: string;
  history: Pick<History, 'id'>;

  constructor(obj: UpdateRoleAPIBody) {
    super(obj);
    this.spec = new RoleSpec(obj.spec);
  }

  static isUpdateRoleAPIBody(body: any): body is UpdateRoleAPIBody {
    return body.history?.id !== undefined;
  }
}
