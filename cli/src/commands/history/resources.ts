import { Command, Option } from 'clipanion';
import { ClientService } from '../../client';
import { stringify } from 'yaml';
import { autoInjectable, inject } from 'tsyringe';

@autoInjectable()
export class GetResourceHistoryCommand extends Command {
  static paths = [['history'], ['h']];
  static usage = Command.Usage({
    category: 'History',
    description: 'Get the history of a single resource',
    examples: [
      ['Get history ', 'optdctl get versions/myservice'],
      ['Get history by kind', 'optdctl get versions myservice'],
    ],
  });

  private readonly clientService: ClientService;

  constructor(clientService?: ClientService) {
    super();
    this.clientService = clientService!;
  }

  kind = Option.String({ required: true });
  name = Option.String({ required: true });

  async execute(): Promise<number | void> {
    const client = await this.clientService.getClient();

    let kind = this.kind;
    let name = this.name;
    let rest = [];

    if (name === undefined && kind.indexOf('/') !== -1) {
      [kind, name, ...rest] = kind.split('/');
    }

    const resp = await client
      .url(`/namespaces/foo/resources/${kind}/${name}/history`)
      .get()
      .json();

    this.context.stdout.write(stringify(resp) + '\n');
  }
}
