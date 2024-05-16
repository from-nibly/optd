import { Command, Option } from 'clipanion';
import { stringify } from 'yaml';
import { ClientService } from '../../client';
import { autoInjectable } from 'tsyringe';

@autoInjectable()
export class GetRoleCommand extends Command {
  static paths = [
    ['get', 'role'],
    ['g', 'role'],
    ['get', 'roles'],
    ['g', 'roles'],
  ];
  static usage = Command.Usage({
    category: 'Configuration',
    description: 'List or get roles',
    details: `
      This command will List or get roles.
    `,
    examples: [
      ['List all roles', 'optdctl get role'],
      ['Get a single role', 'optdctl get role <role-name>'],
    ],
  });

  private readonly clientService: ClientService;

  constructor(clientService?: ClientService) {
    super();
    this.clientService = clientService!;
  }

  name = Option.String({ required: false });

  async execute(): Promise<number | void> {
    const client = await this.clientService.getClient();
    if (this.name) {
      const resp = await client.url(`/meta/roles/${this.name}`).get().json();
      this.context.stdout.write(stringify(resp) + '\n');
      return;
    }
    const resp = await client.url('/meta/roles').get().json();
    this.context.stdout.write(stringify(resp) + '\n');
  }
}
