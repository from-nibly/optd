import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import {
  KindAPIResponse,
  PutKindAPIBody,
  UpdateKindAPIBody,
} from './kinds.types.api';
import { KindService } from './kinds.service';
import { CreateKindRecord, UpdateKindRecord } from './kinds.types.record';

@Controller('/meta/kinds')
@UseInterceptors(ClassSerializerInterceptor)
export class KindController {
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
    @Body() body: PutKindAPIBody | UpdateKindAPIBody,
  ): Promise<KindAPIResponse> {
    //TODO: run validate hooks
    //TODO: be lose with what you accept

    if (UpdateKindAPIBody.isUpdateKindAPIBody(body)) {
      const record = UpdateKindRecord.fromAPIBody(body, kindName);

      const updated = await this.kindService.updateKind(
        record,
        'test user',
        'test message',
      );
      return KindAPIResponse.fromRecord(updated);
    }

    const record = CreateKindRecord.fromAPIBody(body, kindName);
    const created = await this.kindService.createKind(
      record,
      'test user',
      'test message',
    );
    return KindAPIResponse.fromRecord(created);
  }
}
