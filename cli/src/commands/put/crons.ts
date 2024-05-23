import { Command, Option } from 'clipanion';
import { PutCommand } from './root';
import { stringify } from 'yaml';
import { autoInjectable } from 'tsyringe';
import { ClientService } from '../../client';

@autoInjectable()
export class PutCronCommand extends PutCommand {
  static paths = [
    ['put', 'cron'],
    ['p', 'cron'],
    ['put', 'crons'],
    ['p', 'crons'],
  ];
  static usage = Command.Usage({
    category: 'Configuration',
    description: 'Put a cron',
    details: `
      This command will create or update a cron.
    `,
    examples: [
      ['Create or update a cron', 'optdctl put cron <cron>'],
      [
        'Create or update a cron from a file',
        'optdctl put cron <cron> -f <file>',
      ],
      [
        'Create or update a cron from stdin',
        'cat <file> | optdctl put cron <cron> -f -',
      ],
    ],
  });

  private readonly clientService: ClientService;

  constructor(clientService?: ClientService) {
    super();
    this.clientService = clientService!;
  }

  cron = Option.String({ required: false });

  async execute(): Promise<number | void> {
    const client = await this.clientService.getClient();
    let cron = this.cron;

    const outputcron = await this.obtainData(cron, 'cron');

    outputcron.metadata ??= {};
    outputcron.metadata.name ??= cron;

    delete outputcron.metadata.cron;

    if (!outputcron.metadata.name) {
      throw new Error('cron must have a name');
    }

    const resp = await client
      .url(`/meta/crons/${outputcron.metadata.name}`)
      .json(outputcron)
      .put();

    this.context.stdout.write(stringify(await resp.json()) + '\n');
  }
}
