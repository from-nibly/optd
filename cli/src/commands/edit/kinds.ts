import { Command, Option } from 'clipanion';
import { EditCommand } from './root';
import { stringify } from 'yaml';
import { ClientService } from '../../client';
import { autoInjectable } from 'tsyringe';

@autoInjectable()
export class EditKindCommand extends EditCommand {
  static paths = [
    ['edit', 'kind'],
    ['e', 'kind'],
    ['edit', 'k'],
    ['e', 'k'],
  ];
  static usage = Command.Usage({
    category: 'Configuration',
    description: 'edit an existing kind',
    examples: [['Edit a kind by using your editor', 'optdctl edit <kind>']],
  });

  private readonly clientService: ClientService;

  constructor(clientService?: ClientService) {
    super();
    this.clientService = clientService!;
  }

  kind = Option.String({ required: true });

  async execute(): Promise<number | void> {
    const client = await this.clientService.getClient();
    let kind = this.kind;

    const existing = await client.url(`/meta/kinds/${kind}`).get().json();

    //TODO: type checking?
    const outputObj = await this.obtainData(existing as any);

    if (stringify(outputObj) === stringify(existing)) {
      this.context.stdout.write('No changes detected\n');
      return 0;
    }

    outputObj.metadata ??= {};

    delete outputObj.metadata.kind;

    await client.url(`/meta/kinds/${kind}`).json(outputObj).put();
  }
}
