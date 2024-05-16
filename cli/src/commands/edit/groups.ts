import { Command, Option } from 'clipanion';
import { EditCommand } from './root';
import { stringify } from 'yaml';
import { ClientService } from '../../client';
import { autoInjectable } from 'tsyringe';

@autoInjectable()
export class EditGroupCommand extends EditCommand {
  static paths = [
    ['edit', 'group'],
    ['e', 'group'],
    ['edit', 'k'],
    ['e', 'k'],
  ];
  static usage = Command.Usage({
    category: 'Configuration',
    description: 'edit an existing group',
    examples: [['Edit a group by using your editor', 'optdctl edit <group>']],
  });

  private readonly clientService: ClientService;

  constructor(clientService?: ClientService) {
    super();
    this.clientService = clientService!;
  }

  group = Option.String({ required: true });

  async execute(): Promise<number | void> {
    const client = await this.clientService.getClient();
    let group = this.group;

    const existing = await client.url(`/meta/groups/${group}`).get().json();

    //TODO: type checking?
    const outputObj = await this.obtainData(existing as any);

    if (stringify(outputObj) === stringify(existing)) {
      this.context.stdout.write('No changes detected\n');
      return 0;
    }

    outputObj.metadata ??= {};

    delete outputObj.metadata.group;

    await client.url(`/meta/groups/${group}`).json(outputObj).put();
  }
}
