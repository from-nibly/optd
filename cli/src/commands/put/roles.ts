import { Command, Option } from 'clipanion';
import { PutCommand } from './root';
import { stringify } from 'yaml';
import { autoInjectable } from 'tsyringe';
import { ClientService } from '../../client';

@autoInjectable()
export class PutRoleCommand extends PutCommand {
  static paths = [
    ['put', 'role'],
    ['p', 'role'],
    ['put', 'roles'],
    ['p', 'roles'],
  ];
  static usage = Command.Usage({
    category: 'Configuration',
    description: 'Put a role',
    details: `
      This command will create or update a role.
    `,
    examples: [
      ['Create or update a role', 'optdctl put role <role>'],
      [
        'Create or update a role from a file',
        'optdctl put role <role> -f <file>',
      ],
      [
        'Create or update a role from stdin',
        'cat <file> | optdctl put role <role> -f -',
      ],
    ],
  });

  private readonly clientService: ClientService;

  constructor(clientService?: ClientService) {
    super();
    this.clientService = clientService!;
  }

  role = Option.String({ required: false });

  async execute(): Promise<number | void> {
    const client = await this.clientService.getClient();
    let role = this.role;

    const outputrole = await this.obtainData(role, 'role');

    outputrole.metadata ??= {};
    outputrole.metadata.name ??= role;

    delete outputrole.metadata.role;

    if (!outputrole.metadata.name) {
      throw new Error('role must have a name');
    }

    const resp = await client
      .url(`/meta/roles/${outputrole.metadata.name}`)
      .json(outputrole)
      .put();

    this.context.stdout.write(stringify(await resp.json()) + '\n');
  }
}
