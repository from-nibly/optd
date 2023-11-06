import { Controller, Get, Logger, Param } from '@nestjs/common';
import { ResourceService } from './resources.service';
import { ResourceAPIResponse } from './resources.types.api';

@Controller('/namespaces')
export class ResourceController {
  private readonly logger = new Logger(ResourceController.name);
  constructor(private readonly resourceService: ResourceService) {}

  @Get('/:namespace/:resourceKind/')
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
}
