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
import { MetaResourceService } from './meta.service';
import { CreateMeta, UpdateMeta } from './meta.types';
import {
  CreateMetaAPIBody,
  MetaAPIResponse,
  UpdateMetaAPIBody,
} from './meta.types.api';
import { ACTOR_CONTEXT } from 'src/authentication/authentication.guard';

@Controller('/meta/:resourceKind')
@UseInterceptors(ClassSerializerInterceptor)
export class MetaController {
  private readonly logger = new Logger(MetaController.name);

  constructor(private readonly metaService: MetaResourceService) {}

  @Get('/')
  async listMetas(
    @Req() req: any,
    @Param('resourceKind') resourceKind: string,
  ): Promise<MetaAPIResponse[]> {
    const actor = req[ACTOR_CONTEXT];
    const resources = await this.metaService.listMetaResources(
      actor,
      resourceKind,
    );

    return resources.map((r) => MetaAPIResponse.fromRecord(r));
  }

  @Get('/:name')
  async getMeta(
    @Param('name') name: string,
    @Req() req: any,
    @Param('resourceKind') resourceKind: string,
  ): Promise<MetaAPIResponse> {
    const actor = req[ACTOR_CONTEXT];
    const record = await this.metaService.getMetaResource(
      actor,
      resourceKind,
      name,
    );
    return MetaAPIResponse.fromRecord(record);
  }

  @Put('/:name')
  async createMeta(
    @Param('name') metaName: string,
    @Body() body: CreateMetaAPIBody | UpdateMetaAPIBody,
    @Req() req: any,
    @Param('resourceKind') resourceKind: string,
  ): Promise<MetaAPIResponse> {
    const actor = req[ACTOR_CONTEXT];
    //TODO: be loose with what you accept

    let response: MetaAPIResponse | undefined = undefined;

    this.logger.log('got body', body);
    if (UpdateMetaAPIBody.isUpdateMetaAPIBody(body)) {
      const record = UpdateMeta.fromAPIRequest(
        body,
        body.metadata.name ?? metaName,
        resourceKind,
      );
      this.logger.log('got record', { record });

      const updated = await this.metaService.updateMetaResource(
        actor,
        resourceKind,
        record,
        'test message',
      );

      response = MetaAPIResponse.fromRecord(updated);
    } else {
      const record = CreateMeta.fromAPIRequest(
        body,
        body.metadata.name ?? metaName,
        resourceKind,
      );
      const created = await this.metaService.createMetaResource(
        actor,
        resourceKind,
        record,
        'test message',
      );
      response = MetaAPIResponse.fromRecord(created);
    }

    return response;
  }
}
