import { Command, Option } from 'clipanion';
import { stringify } from 'yaml';
import { ClientService } from '../../client';
import { autoInjectable } from 'tsyringe';

@autoInjectable()
export class GetKindCommand extends Command {
  static paths = [
    ['get', 'kind'],
    ['g', 'kind'],
    ['get', 'kinds'],
    ['g', 'kinds'],
  ];
  static usage = Command.Usage({
    category: 'Configuration',
    description: 'List or get Kinds',
    details: `
      This command will List or get Kinds.
    `,
    examples: [
      ['List all kinds', 'optdctl get kind'],
      ['Get a single kind', 'optdctl get kind <kind-name>'],
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
      const resp = await client.url(`/meta/kinds/${this.name}`).get().json();
      this.context.stdout.write(stringify(resp) + '\n');
      return;
    }
    const resp = await client.url('/meta/kinds').get().json();
    this.context.stdout.write(stringify(resp) + '\n');
  }
}
