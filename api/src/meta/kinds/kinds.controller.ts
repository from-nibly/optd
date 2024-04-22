import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Logger,
  Param,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { KindService } from './kinds.service';
import { CreateKind, UpdateKind } from './kinds.types';
import {
  CreateKindAPIBody,
  KindAPIResponse,
  UpdateKindAPIBody,
} from './kinds.types.api';

@Controller('/meta/kinds')
@UseInterceptors(ClassSerializerInterceptor)
export class KindController {
  private readonly logger = new Logger(KindController.name);

  constructor(private readonly kindService: KindService) {}

  @Get('/')
  async listKinds(): Promise<KindAPIResponse[]> {
    const kinds = await this.kindService.listKinds();

    return kinds.map((r) => KindAPIResponse.fromRecord(r));
  }

  @Get('/:name')
  async getKind(@Param('name') name: string): Promise<KindAPIResponse> {
    const record = await this.kindService.getKind(name);
    return KindAPIResponse.fromRecord(record);
  }

  @Put('/:name')
  async createKind(
    @Param('name') kindName: string,
    @Body() body: CreateKindAPIBody | UpdateKindAPIBody,
  ): Promise<KindAPIResponse> {
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
        'test user',
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
        'test user',
        'test message',
      );
      response = KindAPIResponse.fromRecord(created);
    }

    return response;
  }
}
