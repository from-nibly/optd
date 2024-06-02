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
import { HooksService } from 'src/hooks/hooks.service';
import { ResourceService } from './resources.service';
import {
  NamespacedCreateResourceAPIBody,
  NamespacedResourceAPIResponse,
  NamespacedUpdateResourceAPIBody,
} from './resources.types.api';
import {
  NamespacedCreateResource,
  NamespacedUpdateResource,
} from './resources.types';
import { ACTOR_CONTEXT } from 'src/authentication/authentication.guard';
import { Request } from 'express';

@Controller('/namespaces/:namespace/:resourceKind/')
@UseInterceptors(ClassSerializerInterceptor)
export class ResourceController {
  private readonly logger = new Logger(ResourceController.name);
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
      namespace,
      resourceKind,
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
    this.logger.debug(`getting resource ${namespace}/${resourceKind}/${name}`);
    const actor = req[ACTOR_CONTEXT];
    const resource = await this.resourceService.getResource(
      actor,
      namespace,
      resourceKind,
      name,
    );
    return NamespacedResourceAPIResponse.fromRecord(resource, resourceKind);
  }

  @Put('/:name')
  async putResource(
    @Param('namespace') namespace: string,
    @Param('resourceKind') resourceKind: string,
    @Param('name') name: string,
    @Body()
    body: NamespacedCreateResourceAPIBody | NamespacedUpdateResourceAPIBody,
    @Req() req: any,
  ): Promise<NamespacedResourceAPIResponse> {
    const actor = req[ACTOR_CONTEXT];
    this.logger.debug('putting resource', body);
    if (NamespacedUpdateResourceAPIBody.isUpdateResourceAPIBody(body)) {
      const record = NamespacedUpdateResource.fromAPIRequest(
        body,
        namespace,
        name,
      );
      await this.hookService.executeHook(
        actor,
        resourceKind,
        'validate',
        record,
        record.metadata.name,
      );
      const updated = await this.resourceService.updateResource(
        actor,
        record,
        resourceKind,
        'test message',
      );
      return NamespacedResourceAPIResponse.fromRecord(updated, resourceKind);
    }

    const record = NamespacedCreateResource.fromAPIRequest(
      body,
      body.metadata.kind ?? resourceKind,
      body.metadata.namespace ?? namespace,
      body.metadata.name ?? name,
    );
    await this.hookService.executeHook(
      actor,
      resourceKind,
      'validate',
      record,
      record.metadata.name,
    );
    const created = await this.resourceService.createResource(
      actor,
      record,
      resourceKind,
      'test message',
    );
    return NamespacedResourceAPIResponse.fromRecord(created, resourceKind);
  }
}
