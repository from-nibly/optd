import { Enforcer } from 'casbin';

export class BasicAuthorizer {
  constructor(
    private readonly req: any,
    private readonly enforcer: Enforcer,
  ) {}

  getUserRole() {
    return this.req.user.role;
  }

  checkPermission() {
    const { originalUrl: path, method } = this.req;
    const userRole = this.getUserRole();
    return this.enforcer.enforce(userRole, path, method);
  }
}
