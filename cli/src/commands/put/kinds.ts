import { Command, Option } from 'clipanion';
import { PutCommand } from './root';
import { stringify } from 'yaml';
import { ClientService } from '../../client';
import { autoInjectable } from 'tsyringe';

@autoInjectable()
export class PutKindCommand extends PutCommand {
  static paths = [
    ['put', 'kind'],
    ['p', 'kind'],
    ['put', 'kinds'],
    ['p', 'kinds'],
  ];
  static usage = Command.Usage({
    category: 'Configuration',
    description: 'Put a kind',
    details: `
      This command will create or update a kind.
    `,
    examples: [
      ['Create or update a kind', 'optdctl put kind <kind>'],
      [
        'Create or update a kind from a file',
        'optdctl put kind <kind> -f <file>',
      ],
      [
        'Create or update a kind from stdin',
        'cat <file> | optdctl put kind <kind> -f -',
      ],
    ],
  });

  private readonly clientService: ClientService;

  constructor(clientService?: ClientService) {
    super();
    this.clientService = clientService!;
  }

  kind = Option.String({ required: false });

  async execute(): Promise<number | void> {
    const client = await this.clientService.getClient();
    let kind = this.kind;

    const outputKind = await this.obtainData(kind, 'kind');

    outputKind.metadata ??= {};
    outputKind.metadata.name ??= kind;

    delete outputKind.metadata.kind;

    if (!outputKind.metadata.name) {
      throw new Error('kind must have a name');
    }

    const resp = await client
      .url(`/meta/kinds/${outputKind.metadata.name}`)
      .json(outputKind)
      .put();

    this.context.stdout.write(stringify(await resp.json()) + '\n');
  }
}
