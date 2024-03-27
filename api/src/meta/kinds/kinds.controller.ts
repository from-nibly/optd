import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseInterceptors,
} from '@nestjs/common';
import { HooksService } from 'src/hooks/hooks.service';
import { KindService } from './kinds.service';
import { KindAPIResponse } from './kinds.types.api';

@Controller('/meta/kinds')
@UseInterceptors(ClassSerializerInterceptor)
export class KindController {
  constructor(
    private readonly kindService: KindService,
    private readonly hookService: HooksService,
  ) {}

  @Get('/')
  async listKinds(): Promise<KindAPIResponse[]> {
    const kinds = await this.kindService.listKinds();

    return kinds.map((r) => KindAPIResponse.fromRecord(r));
  }

  // @Get('/:name')
  // async getKind(@Param('name') name: string): Promise<KindAPIResponse> {
  //   const record = await this.kindService.getKind(name);
  //   return KindAPIResponse.fromRecord(record);
  // }

  // @Put('/:name')
  // async createKind(
  //   @Param('name') kindName: string,
  //   @Body() body: PutKindAPIBody | UpdateKindAPIBody,
  // ): Promise<KindAPIResponse> {
  //   //TODO: be loose with what you accept

  //   let response: KindAPIResponse | undefined = undefined;

  //   if (UpdateKindAPIBody.isUpdateKindAPIBody(body)) {
  //     const record = UpdateKindRecord.fromAPIBody(body, kindName);

  //     const updated = await this.kindService.updateKind(
  //       record,
  //       'test user',
  //       'test message',
  //     );

  //     response = KindAPIResponse.fromRecord(updated);
  //   } else {
  //     const record = CreateKindRecord.fromAPIBody(body, kindName);
  //     const created = await this.kindService.createKind(
  //       record,
  //       'test user',
  //       'test message',
  //     );
  //     response = KindAPIResponse.fromRecord(created);
  //   }

  //   this.hookService.configureHooks(
  //     kindName,
  //     response.metadata.rev,
  //     body.spec.hooks,
  //   );

  //   return response;
  // }
}
