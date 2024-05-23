import {
  GlobalCreateResource,
  GlobalResource,
  GlobalUpdateResource,
} from 'src/resources/resources.types';
import { CreateCronAPIBody, UpdateCronAPIBody } from './crons.types.api';
import { NonMethodFields } from 'src/types/types';
import { CronDBRecord } from './crons.types.record';

export class CronSpec {
  schedule: string;
  script: string;
  tz: string;
  //TODO: retry policy
  constructor(obj: CronSpec) {
    this.schedule = obj.schedule;
    this.schedule = obj.schedule;
    this.tz = obj.tz;
  }
}

export class Cron extends GlobalResource {
  spec: CronSpec;

  constructor(obj: Cron) {
    super(obj);
    this.spec = new CronSpec(obj.spec);
  }

  static get kind(): 'crons' {
    return 'crons';
  }

  static fromDBRecord(record: CronDBRecord) {
    return GlobalResource.fromDBRecord(record, 'cron', Cron);
  }
}

export class CreateCron extends GlobalCreateResource {
  spec: CronSpec;

  constructor(obj: NonMethodFields<CreateCron>) {
    super(obj);
    this.spec = new CronSpec(obj.spec);
  }

  static fromAPIRequest(request: CreateCronAPIBody, name: string): CreateCron {
    return GlobalCreateResource.fromAPIRequest<CreateCronAPIBody>(
      request,
      name,
      Cron.kind,
      CreateCron,
    );
  }
}

export class UpdateCron extends GlobalUpdateResource {
  spec: CronSpec;

  constructor(obj: NonMethodFields<UpdateCron>) {
    super(obj);
    this.spec = new CronSpec(obj.spec);
  }

  static fromAPIRequest(request: UpdateCronAPIBody, name: string): UpdateCron {
    return GlobalUpdateResource.fromAPIRequest(
      request,
      name,
      Cron.kind,
      UpdateCron,
    );
  }
}
