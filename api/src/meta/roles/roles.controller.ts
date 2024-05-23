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
import { RoleService } from './roles.service';
import {
  RoleAPIResponse,
  CreateRoleAPIBody,
  UpdateRoleAPIBody,
} from './roles.types.api';
import { CreateRole, UpdateRole } from './roles.types';
import { ACTOR_CONTEXT } from 'src/authentication/authentication.guard';

@Controller('/meta/roles')
@UseInterceptors(ClassSerializerInterceptor)
export class RoleController {
  private readonly logger = new Logger(RoleController.name);

  constructor(private readonly roleService: RoleService) {}

  @Get('/')
  async listRoles(@Req() req: any): Promise<RoleAPIResponse[]> {
    const actor = req[ACTOR_CONTEXT];
    const roles = await this.roleService.listRoles(actor);

    return roles.map((r) => RoleAPIResponse.fromRecord(r));
  }

  @Get('/:name')
  async getRole(
    @Param('name') name: string,
    @Req() req: any,
  ): Promise<RoleAPIResponse> {
    const actor = req[ACTOR_CONTEXT];
    const record = await this.roleService.getRole(actor, name);
    const resp = RoleAPIResponse.fromRecord(record);
    return resp;
  }

  @Put('/:name')
  async createRole(
    @Param('name') roleName: string,
    @Body() body: CreateRoleAPIBody | UpdateRoleAPIBody,
    @Req() req: any,
  ): Promise<RoleAPIResponse> {
    const actor = req[ACTOR_CONTEXT];
    let response: RoleAPIResponse | undefined = undefined;

    if (UpdateRoleAPIBody.isUpdateRoleAPIBody(body)) {
      //TODO: is this the right behavior?
      const record = UpdateRole.fromAPIRequest(
        body,
        body.metadata.name ?? roleName,
      );
      this.logger.log('got record', { record });

      const updated = await this.roleService.updateRole(
        actor,
        record,
        'test message',
      );

      response = RoleAPIResponse.fromRecord(updated);
    } else {
      const record = CreateRole.fromAPIRequest(
        body,
        body.metadata.name ?? roleName,
      );
      const created = await this.roleService.createRole(
        actor,
        record,
        'test message',
      );
      response = RoleAPIResponse.fromRecord(created);
    }

    return response;
  }
}
