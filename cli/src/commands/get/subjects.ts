import { Command, Option } from 'clipanion';
import { stringify } from 'yaml';
import { ClientService } from '../../client';
import { autoInjectable } from 'tsyringe';

@autoInjectable()
export class GetSubjectCommand extends Command {
  static paths = [
    ['get', 'subject'],
    ['g', 'subject'],
    ['get', 'subjects'],
    ['g', 'subjects'],
  ];
  static usage = Command.Usage({
    category: 'Configuration',
    description: 'List or get subjects',
    details: `
      This command will List or get subjects.
    `,
    examples: [
      ['List all subjects', 'optdctl get subject'],
      ['Get a single subject', 'optdctl get subject <subject-name>'],
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
      const resp = await client.url(`/meta/subjects/${this.name}`).get().json();
      this.context.stdout.write(stringify(resp) + '\n');
      return;
    }
    const resp = await client.url('/meta/subjects').get().json();
    this.context.stdout.write(stringify(resp) + '\n');
  }
}
