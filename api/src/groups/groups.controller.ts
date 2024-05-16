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
import { GroupService } from './groups.service';
import {
  GroupAPIResponse,
  CreateGroupAPIBody,
  UpdateGroupAPIBody,
} from './groups.types.api';
import { CreateGroup, UpdateGroup } from './groups.types';
import { ACTOR_CONTEXT } from 'src/authentication/authentication.guard';

@Controller('/meta/groups')
@UseInterceptors(ClassSerializerInterceptor)
export class GroupController {
  private readonly logger = new Logger(GroupController.name);

  constructor(private readonly groupService: GroupService) {}

  @Get('/')
  async listGroups(): Promise<GroupAPIResponse[]> {
    const groups = await this.groupService.listGroups();

    return groups.map((r) => GroupAPIResponse.fromRecord(r));
  }

  @Get('/:name')
  async getGroup(@Param('name') name: string): Promise<GroupAPIResponse> {
    const record = await this.groupService.getGroup(name);
    const resp = GroupAPIResponse.fromRecord(record);
    this.logger.debug('got group', { record, resp });
    return resp;
  }

  @Put('/:name')
  async createGroup(
    @Param('name') groupName: string,
    @Body() body: CreateGroupAPIBody | UpdateGroupAPIBody,
    @Req() req: any,
  ): Promise<GroupAPIResponse> {
    const actor = req[ACTOR_CONTEXT];
    let response: GroupAPIResponse | undefined = undefined;

    if (UpdateGroupAPIBody.isUpdateGroupAPIBody(body)) {
      //TODO: is this the right behavior?
      const record = UpdateGroup.fromAPIRequest(
        body,
        body.metadata.name ?? groupName,
      );
      this.logger.log('got record', { record });

      const updated = await this.groupService.updateGroup(
        record,
        actor,
        'test message',
      );

      response = GroupAPIResponse.fromRecord(updated);
    } else {
      const record = CreateGroup.fromAPIRequest(
        body,
        body.metadata.name ?? groupName,
      );
      const created = await this.groupService.createGroup(
        record,
        actor,
        'test message',
      );
      response = GroupAPIResponse.fromRecord(created);
    }

    return response;
  }
}
