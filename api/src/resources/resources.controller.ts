import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Logger,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { HooksService } from 'src/hooks/hooks.service';
import { ResourceService } from './resources.service';
import { ResourceAPIResponse } from './resources.types.api';

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
  ): Promise<ResourceAPIResponse[]> {
    this.logger.debug(`getting resources for ${namespace}/${resourceKind}`);
    const resources = await this.resourceService.listResources(
      namespace,
      resourceKind,
    );
    return resources.map((r) =>
      ResourceAPIResponse.fromRecord(r, resourceKind),
    );
  }

  // @Get('/:name')
  // async getResource(
  //   @Param('namespace') namespace: string,
  //   @Param('resourceKind') resourceKind: string,
  //   @Param('name') name: string,
  // ): Promise<ResourceAPIResponse> {
  //   this.logger.debug(`getting resource ${namespace}/${resourceKind}/${name}`);
  //   const resource = await this.resourceService.getResource(
  //     namespace,
  //     resourceKind,
  //     name,
  //   );
  //   return ResourceAPIResponse.fromRecord(resource, resourceKind);
  // }

  // @Put('/:name')
  // async putResource(
  //   @Param('namespace') namespace: string,
  //   @Param('resourceKind') resourceKind: string,
  //   @Param('name') name: string,
  //   @Body() body: PutResourceAPIBody | UpdateResourceAPIBody,
  // ): Promise<ResourceAPIResponse> {
  //   await this.hookService.executeHook('validate', resourceKind, body);

  //   if (UpdateResourceAPIBody.isUpdateResourceAPIBody(body)) {
  //     const record = UpdateResourceRecord.fromAPIBody(body, namespace, name);

  //     const updated = await this.resourceService.updateResource(
  //       record,
  //       resourceKind,
  //       'test user',
  //       'test message',
  //     );
  //     return ResourceAPIResponse.fromRecord(updated, resourceKind);
  //   }

  //   const record = CreateResourceRecord.fromAPIBody(body, namespace, name);
  //   const created = await this.resourceService.createResource(
  //     record,
  //     resourceKind,
  //     'test user',
  //     'test message',
  //   );
  //   return ResourceAPIResponse.fromRecord(created, resourceKind);
  // }
}
