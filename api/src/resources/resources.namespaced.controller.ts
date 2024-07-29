import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Logger,
  Param,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ACTOR_CONTEXT } from 'src/authentication/authentication.guard';
import { HooksService } from 'src/hooks/hooks.service';
import { ResourceService } from './resources.service';
import { NamespacedResourceAPIResponse } from './resources.types.api';

@Controller('/namespaces/:namespace/resources/:resourceKind/')
@UseInterceptors(ClassSerializerInterceptor)
export class ResourceNamespacedController {
  private readonly logger = new Logger(ResourceNamespacedController.name);
  constructor(
    private readonly resourceService: ResourceService,
    private readonly hookService: HooksService,
  ) {}

  @Get('/')
  async listResources(
    @Param('namespace') namespace: string,
    @Param('resourceKind') resourceKind: string,
    @Req() req: any,
  ): Promise<NamespacedResourceAPIResponse[]> {
    const actor = req[ACTOR_CONTEXT];
    this.logger.debug(`getting resources for ${namespace}/${resourceKind}`, {
      actor,
    });
    const resources = await this.resourceService.listResources(
      actor,
      resourceKind,
      namespace,
    );
    return resources.map((r) =>
      NamespacedResourceAPIResponse.fromRecord(r, resourceKind),
    );
  }

  @Get('/:name')
  async getResource(
    @Param('namespace') namespace: string,
    @Param('resourceKind') resourceKind: string,
    @Param('name') name: string,
    @Req() req: any,
  ): Promise<NamespacedResourceAPIResponse> {
    this.logger.debug(`getting resource ${resourceKind}/${name}`);
    const actor = req[ACTOR_CONTEXT];
    const resource = await this.resourceService.getResource(
      actor,
      resourceKind,
      name,
      namespace,
    );
    return NamespacedResourceAPIResponse.fromRecord(resource, resourceKind);
  }

  @Get('/:name/history')
  async getHistory(
    @Param('namespace') namespace: string,
    @Param('resourceKind') resourceKind: string,
    @Param('name') name: string,
    @Req() req: any,
  ): Promise<NamespacedResourceAPIResponse[]> {
    this.logger.debug(`getting resource ${resourceKind}/${name}`);
    const actor = req[ACTOR_CONTEXT];
    const resources = await this.resourceService.listResourceHistory(
      actor,
      resourceKind,
      name,
      namespace,
    );
    return resources.map((r) =>
      NamespacedResourceAPIResponse.fromRecord(r, resourceKind),
    );
  }
}
