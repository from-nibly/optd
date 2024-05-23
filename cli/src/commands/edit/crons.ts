import { Command, Option } from 'clipanion';
import { EditCommand } from './root';
import { stringify } from 'yaml';
import { ClientService } from '../../client';
import { autoInjectable } from 'tsyringe';

@autoInjectable()
export class EditCronCommand extends EditCommand {
  static paths = [
    ['edit', 'cron'],
    ['e', 'cron'],
    ['edit', 'k'],
    ['e', 'k'],
  ];
  static usage = Command.Usage({
    category: 'Configuration',
    description: 'edit an existing cron',
    examples: [['Edit a cron by using your editor', 'optdctl edit <cron>']],
  });

  private readonly clientService: ClientService;

  constructor(clientService?: ClientService) {
    super();
    this.clientService = clientService!;
  }

  cron = Option.String({ required: true });

  async execute(): Promise<number | void> {
    const client = await this.clientService.getClient();
    let cron = this.cron;

    const existing = await client.url(`/meta/crons/${cron}`).get().json();

    //TODO: type checking?
    const outputObj = await this.obtainData(existing as any);

    if (stringify(outputObj) === stringify(existing)) {
      this.context.stdout.write('No changes detected\n');
      return 0;
    }

    outputObj.metadata ??= {};

    delete outputObj.metadata.cron;

    const resp = await client.url(`/meta/crons/${cron}`).json(outputObj).put();

    this.context.stdout.write(stringify(await resp.json()) + '\n');
  }
}
