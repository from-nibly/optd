import { Command, Option } from 'clipanion';
import { stringify } from 'yaml';
import { ClientService } from '../../client';
import { autoInjectable } from 'tsyringe';

@autoInjectable()
export class GetGroupCommand extends Command {
  static paths = [
    ['get', 'group'],
    ['g', 'group'],
    ['get', 'groups'],
    ['g', 'groups'],
  ];
  static usage = Command.Usage({
    category: 'Configuration',
    description: 'List or get groups',
    details: `
      This command will List or get groups.
    `,
    examples: [
      ['List all groups', 'optdctl get group'],
      ['Get a single group', 'optdctl get group <group-name>'],
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
      const resp = await client.url(`/meta/groups/${this.name}`).get().json();
      this.context.stdout.write(stringify(resp) + '\n');
      return;
    }
    const resp = await client.url('/meta/groups').get().json();
    this.context.stdout.write(stringify(resp) + '\n');
  }
}
