import { History } from 'src/types/types';
import {
  GlobalCreateMetaApiBody,
  GlobalMetaAPIResponse,
} from 'src/types/types.api';
import { Subject, SubjectSpec } from './subjects.types';
import {
  GlobalCreateResourceAPIBody,
  GlobalResourceAPIResponse,
  GlobalUpdateResourceAPIBody,
} from 'src/resources/resources.types.api';

export class SubjectAPIResponse extends GlobalResourceAPIResponse {
  metadata: GlobalMetaAPIResponse;
  spec: SubjectSpec;
  status: any;
  history: History;
  state: string;

  constructor(obj: SubjectAPIResponse) {
    super(obj);
    this.spec = new SubjectSpec(obj.spec);
  }

  static fromRecord(
    record: Subject,
    kind: string = 'subject',
  ): SubjectAPIResponse {
    return new SubjectAPIResponse({
      metadata: GlobalMetaAPIResponse.fromRecord(record.metadata, kind),
      spec: new SubjectSpec(record.spec),
      status: record.status,
      history: record.history,
      state: record.state,
    });
  }
}

export class CreateSubjectAPIBody extends GlobalCreateResourceAPIBody {
  metadata: GlobalCreateMetaApiBody;
  spec: any;
}

export class UpdateSubjectAPIBody extends GlobalUpdateResourceAPIBody {
  metadata: GlobalCreateMetaApiBody;
  spec: any;
  status: any;
  state: string;
  history: Pick<History, 'id'>;

  constructor(obj: UpdateSubjectAPIBody) {
    super(obj);
    this.spec = new SubjectSpec(obj.spec);
  }

  static isUpdateSubjectAPIBody(body: any): body is UpdateSubjectAPIBody {
    return body.history?.id !== undefined;
  }
}
