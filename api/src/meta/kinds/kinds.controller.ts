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
import { KindService } from './kinds.service';
import { CreateKind, UpdateKind } from './kinds.types';
import {
  CreateKindAPIBody,
  KindAPIResponse,
  UpdateKindAPIBody,
} from './kinds.types.api';
import { ACTOR_CONTEXT } from 'src/authentication/authentication.guard';

@Controller('/meta/kind')
@UseInterceptors(ClassSerializerInterceptor)
export class KindController {
  private readonly logger = new Logger(KindController.name);

  constructor(private readonly kindService: KindService) {}

  @Get('/')
  async listKinds(@Req() req: any): Promise<KindAPIResponse[]> {
    const actor = req[ACTOR_CONTEXT];
    const kinds = await this.kindService.listKinds(actor);

    return kinds.map((r) => KindAPIResponse.fromRecord(r));
  }

  @Get('/:name')
  async getKind(
    @Param('name') name: string,
    @Req() req: any,
  ): Promise<KindAPIResponse> {
    const actor = req[ACTOR_CONTEXT];
    const record = await this.kindService.getKind(actor, name);
    return KindAPIResponse.fromRecord(record);
  }

  @Put('/:name')
  async createKind(
    @Param('name') kindName: string,
    @Body() body: CreateKindAPIBody | UpdateKindAPIBody,
    @Req() req: any,
  ): Promise<KindAPIResponse> {
    const actor = req[ACTOR_CONTEXT];
    //TODO: be loose with what you accept

    let response: KindAPIResponse | undefined = undefined;

    this.logger.log('got body', body);
    if (UpdateKindAPIBody.isUpdateKindAPIBody(body)) {
      const record = UpdateKind.fromAPIRequest(
        body,
        body.metadata.name ?? kindName,
      );
      this.logger.log('got record', { record });

      const updated = await this.kindService.updateKind(
        record,
        actor,
        'test message',
      );

      response = KindAPIResponse.fromRecord(updated);
    } else {
      const record = CreateKind.fromAPIRequest(
        body,
        body.metadata.name ?? kindName,
      );
      const created = await this.kindService.createKind(
        record,
        actor,
        'test message',
      );
      response = KindAPIResponse.fromRecord(created);
    }

    return response;
  }
}
