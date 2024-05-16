import { Command, Option } from 'clipanion';
import { PutCommand } from './root';
import { stringify } from 'yaml';
import { autoInjectable } from 'tsyringe';
import { ClientService } from '../../client';

@autoInjectable()
export class PutGroupCommand extends PutCommand {
  static paths = [
    ['put', 'group'],
    ['p', 'group'],
    ['put', 'groups'],
    ['p', 'groups'],
  ];
  static usage = Command.Usage({
    category: 'Configuration',
    description: 'Put a group',
    details: `
      This command will create or update a group.
    `,
    examples: [
      ['Create or update a group', 'optdctl put group <group>'],
      [
        'Create or update a group from a file',
        'optdctl put group <group> -f <file>',
      ],
      [
        'Create or update a group from stdin',
        'cat <file> | optdctl put group <group> -f -',
      ],
    ],
  });

  private readonly clientService: ClientService;

  constructor(clientService?: ClientService) {
    super();
    this.clientService = clientService!;
  }

  group = Option.String({ required: false });

  async execute(): Promise<number | void> {
    const client = await this.clientService.getClient();
    let group = this.group;

    const outputgroup = await this.obtainData(group, 'group');

    outputgroup.metadata ??= {};
    outputgroup.metadata.name ??= group;

    delete outputgroup.metadata.group;

    if (!outputgroup.metadata.name) {
      throw new Error('group must have a name');
    }

    const resp = await client
      .url(`/meta/groups/${outputgroup.metadata.name}`)
      .json(outputgroup)
      .put();

    this.context.stdout.write(stringify(await resp.json()) + '\n');
  }
}
