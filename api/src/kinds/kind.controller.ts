import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseInterceptors,
} from '@nestjs/common';
import { KindAPIResponse } from './kind.types';
import { KindService } from './kind.service';

@Controller('/kinds')
@UseInterceptors(ClassSerializerInterceptor)
export class KindController {
  constructor(private readonly kindService: KindService) {}

  @Get()
  async listKinds(): Promise<KindAPIResponse[]> {
    return (await this.kindService.listKinds()).map((r) =>
      KindAPIResponse.fromRecord(r),
    );
  }
}
