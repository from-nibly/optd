import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Logger,
  Param,
  Put,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { CronService } from './crons.service';
import {
  CronAPIResponse,
  CreateCronAPIBody,
  UpdateCronAPIBody,
} from './crons.types.api';
import { CreateCron, UpdateCron } from './crons.types';
import { ACTOR_CONTEXT } from 'src/authentication/authentication.guard';

@Controller('/meta/crons')
@UseInterceptors(ClassSerializerInterceptor)
export class CronController {
  private readonly logger = new Logger(CronController.name);

  constructor(private readonly cronService: CronService) {}

  @Get('/')
  async listCrons(@Req() req: any): Promise<CronAPIResponse[]> {
    const actor = req[ACTOR_CONTEXT];
    const crons = await this.cronService.listCrons(actor);

    return crons.map((r) => CronAPIResponse.fromRecord(r));
  }

  @Get('/:name')
  async getCron(
    @Param('name') name: string,
    @Req() req: any,
  ): Promise<CronAPIResponse> {
    const actor = req[ACTOR_CONTEXT];
    const record = await this.cronService.getCron(actor, name);
    const resp = CronAPIResponse.fromRecord(record);
    return resp;
  }

  @Put('/:name')
  async createCron(
    @Param('name') cronName: string,
    @Body() body: CreateCronAPIBody | UpdateCronAPIBody,
    @Req() req: any,
  ): Promise<CronAPIResponse> {
    const actor = req[ACTOR_CONTEXT];
    let response: CronAPIResponse | undefined = undefined;

    if (UpdateCronAPIBody.isUpdateCronAPIBody(body)) {
      //TODO: is this the right behavior?
      const record = UpdateCron.fromAPIRequest(
        body,
        body.metadata.name ?? cronName,
      );
      this.logger.log('got record', { record });

      const updated = await this.cronService.updateCron(
        actor,
        record,
        'test message',
      );

      response = CronAPIResponse.fromRecord(updated);
    } else {
      const record = CreateCron.fromAPIRequest(
        body,
        body.metadata.name ?? cronName,
      );
      const created = await this.cronService.createCron(
        actor,
        record,
        'test message',
      );
      response = CronAPIResponse.fromRecord(created);
    }

    return response;
  }
}
