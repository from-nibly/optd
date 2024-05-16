import { Command, Option } from 'clipanion';
import { EditCommand } from './root';
import { stringify } from 'yaml';
import { ClientService } from '../../client';
import { autoInjectable } from 'tsyringe';

@autoInjectable()
export class EditRoleCommand extends EditCommand {
  static paths = [
    ['edit', 'role'],
    ['e', 'role'],
    ['edit', 'k'],
    ['e', 'k'],
  ];
  static usage = Command.Usage({
    category: 'Configuration',
    description: 'edit an existing role',
    examples: [['Edit a role by using your editor', 'optdctl edit <role>']],
  });

  private readonly clientService: ClientService;

  constructor(clientService?: ClientService) {
    super();
    this.clientService = clientService!;
  }

  role = Option.String({ required: true });

  async execute(): Promise<number | void> {
    const client = await this.clientService.getClient();
    let role = this.role;

    const existing = await client.url(`/meta/roles/${role}`).get().json();

    //TODO: type checking?
    const outputObj = await this.obtainData(existing as any);

    if (stringify(outputObj) === stringify(existing)) {
      this.context.stdout.write('No changes detected\n');
      return 0;
    }

    outputObj.metadata ??= {};

    delete outputObj.metadata.role;

    await client.url(`/meta/roles/${role}`).json(outputObj).put();
  }
}
