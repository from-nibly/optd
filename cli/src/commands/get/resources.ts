import { Command, Option } from 'clipanion';
import { ClientService } from '../../client';
import { stringify } from 'yaml';
import { autoInjectable, inject } from 'tsyringe';

@autoInjectable()
export class GetResourceCommand extends Command {
  static paths = [['get'], ['g']];
  static usage = Command.Usage({
    category: 'Resources',
    description: 'Get a list of resources or a single resource',
    examples: [
      ['Get a resource', 'optdctl get versions/myservice'],
      ['Get a resource by kind', 'optdctl get versions myservice'],
      ['Get a resource by kind', 'optdctl get versions'],
    ],
  });

  private readonly clientService: ClientService;

  constructor(clientService?: ClientService) {
    super();
    this.clientService = clientService!;
  }

  kind = Option.String();
  name = Option.String({ required: false });

  async execute(): Promise<number | void> {
    const client = await this.clientService.getClient();

    let kind = this.kind;
    let name = this.name;
    let rest = [];

    if (name === undefined && kind.indexOf('/') !== -1) {
      [kind, name, ...rest] = kind.split('/');
    }

    if (name === undefined) {
      const resp = await client
        .url(`/namespaces/foo/resources/${kind}`)
        .get()
        .json();

      this.context.stdout.write(stringify(resp) + '\n');
    } else {
      const resp = await client
        .url(`/namespaces/foo/resources/${kind}/${name}`)
        .get()
        .json();

      this.context.stdout.write(stringify(resp) + '\n');
    }
  }
}
