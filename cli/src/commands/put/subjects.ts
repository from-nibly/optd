import { Command, Option } from 'clipanion';
import { PutCommand } from './root';
import { stringify } from 'yaml';
import { autoInjectable } from 'tsyringe';
import { ClientService } from '../../client';

@autoInjectable()
export class PutSubjectCommand extends PutCommand {
  static paths = [
    ['put', 'subject'],
    ['p', 'subject'],
    ['put', 'subjects'],
    ['p', 'subjects'],
  ];
  static usage = Command.Usage({
    category: 'Configuration',
    description: 'Put a subject',
    details: `
      This command will create or update a subject.
    `,
    examples: [
      ['Create or update a subject', 'optdctl put subject <subject>'],
      [
        'Create or update a subject from a file',
        'optdctl put subject <subject> -f <file>',
      ],
      [
        'Create or update a subject from stdin',
        'cat <file> | optdctl put subject <subject> -f -',
      ],
    ],
  });

  private readonly clientService: ClientService;

  constructor(clientService?: ClientService) {
    super();
    this.clientService = clientService!;
  }

  subject = Option.String({ required: false });

  async execute(): Promise<number | void> {
    const client = await this.clientService.getClient();
    let subject = this.subject;

    const outputsubject = await this.obtainData(subject, 'subject');

    outputsubject.metadata ??= {};
    outputsubject.metadata.name ??= subject;

    delete outputsubject.metadata.subject;

    if (!outputsubject.metadata.name) {
      throw new Error('subject must have a name');
    }

    const resp = await client
      .url(`/meta/subjects/${outputsubject.metadata.name}`)
      .json(outputsubject)
      .put();

    this.context.stdout.write(stringify(await resp.json()) + '\n');
  }
}
