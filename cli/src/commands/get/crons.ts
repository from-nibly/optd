import { Command, Option } from 'clipanion';
import { stringify } from 'yaml';
import { ClientService } from '../../client';
import { autoInjectable } from 'tsyringe';

@autoInjectable()
export class GetCronCommand extends Command {
  static paths = [
    ['get', 'cron'],
    ['g', 'cron'],
    ['get', 'crons'],
    ['g', 'crons'],
  ];
  static usage = Command.Usage({
    category: 'Configuration',
    description: 'List or get crons',
    details: `
      This command will List or get crons.
    `,
    examples: [
      ['List all crons', 'optdctl get cron'],
      ['Get a single cron', 'optdctl get cron <cron-name>'],
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
      const resp = await client.url(`/meta/crons/${this.name}`).get().json();
      this.context.stdout.write(stringify(resp) + '\n');
      return;
    }
    const resp = await client.url('/meta/crons').get().json();
    this.context.stdout.write(stringify(resp) + '\n');
  }
}
