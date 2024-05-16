import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ACTOR_CONTEXT,
  IS_PUBLIC_KEY,
} from 'src/authentication/authentication.guard';
import { GroupService } from 'src/groups/groups.service';
import { RoleService } from 'src/roles/roles.service';
import { Subject } from 'src/subjects/subjects.types';
import { ActorContext } from 'src/types/types';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  logger = new Logger(AuthorizationGuard.name);

  constructor(
    private reflector: Reflector,
    //TODO: make authorization service
    private roleService: RoleService,
    private groupService: GroupService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    //TODO: move IS_PUBLIC_KEY to a shared location
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const actor: ActorContext = request[ACTOR_CONTEXT];
    this.logger.debug('authorizing actor', { actor });

    const groups = await this.groupService.listGroupsForSubject(actor.subject);
    this.logger.debug('got groups for actor', { groups });

    const roleNames = [...new Set(groups.map((g) => g.spec.roles).flat())];
    this.logger.debug('got role names for group', { roleNames });

    const roles = await this.roleService.getAllRoles(roleNames);
    this.logger.debug('got roles', { roles });

    actor.roles = roles;

    return true;
  }
}
