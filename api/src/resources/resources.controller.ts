import { Controller, Get, Logger, Param } from '@nestjs/common';
import { ResourceService } from './resources.service';
import { ResourceAPIResponse } from './resources.types.api';

@Controller('/namespaces/:namespace/:resourceKind/')
export class ResourceController {
  private readonly logger = new Logger(ResourceController.name);
  constructor(private readonly resourceService: ResourceService) {}

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

  @Get('/:name')
  async getResource(
    @Param('namespace') namespace: string,
    @Param('resourceKind') resourceKind: string,
    @Param('name') name: string,
  ): Promise<ResourceAPIResponse> {
    this.logger.debug(`getting resource ${namespace}/${resourceKind}/${name}`);
    const resource = await this.resourceService.getResource(
      namespace,
      resourceKind,
      name,
    );
    return ResourceAPIResponse.fromRecord(resource, resourceKind);
  }
}
