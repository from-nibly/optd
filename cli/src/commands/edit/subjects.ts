import { Command, Option } from 'clipanion';
import { EditCommand } from './root';
import { stringify } from 'yaml';
import { ClientService } from '../../client';
import { autoInjectable } from 'tsyringe';

@autoInjectable()
export class EditSubjectCommand extends EditCommand {
  static paths = [
    ['edit', 'subject'],
    ['e', 'subject'],
    ['edit', 'k'],
    ['e', 'k'],
  ];
  static usage = Command.Usage({
    category: 'Configuration',
    description: 'edit an existing subject',
    examples: [
      ['Edit a subject by using your editor', 'optdctl edit <subject>'],
    ],
  });

  private readonly clientService: ClientService;

  constructor(clientService?: ClientService) {
    super();
    this.clientService = clientService!;
  }

  subject = Option.String({ required: true });

  async execute(): Promise<number | void> {
    const client = await this.clientService.getClient();
    let subject = this.subject;

    const existing = await client.url(`/meta/subjects/${subject}`).get().json();

    //TODO: type checking?
    const outputObj = await this.obtainData(existing as any);

    if (stringify(outputObj) === stringify(existing)) {
      this.context.stdout.write('No changes detected\n');
      return 0;
    }

    outputObj.metadata ??= {};

    delete outputObj.metadata.subject;

    await client.url(`/meta/subjects/${subject}`).json(outputObj).put();
  }
}
