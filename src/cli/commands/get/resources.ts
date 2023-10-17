import { Command, Option } from 'clipanion';
import { client } from '../../client';
import { stringify } from 'yaml';

export class GetCommand extends Command {
  static paths = [['get'], ['g']];
  static usage = Command.Usage({
    category: 'Resources',
    description: 'Get a list of resources or a single resource',
    details: `
      This command will get a resource from the API.
    `,
    examples: [
      ['Get a resource', 'optdctl get versions/myservice'],
      ['Get a resource by kind', 'optdctl get versions myservice'],
      ['Get a resource by kind', 'optdctl get versions'],
    ],
  });

  kind = Option.String();
  name = Option.String({ required: false });

  async execute(): Promise<number | void> {
    let kind = this.kind;
    let name = this.name;
    let rest = [];

    if (name === undefined && kind.indexOf('/') !== -1) {
      [kind, name, ...rest] = kind.split('/');
    }

    if (name === undefined) {
      const resp = await client.url(`/namespaces/foo/${kind}`).get().json();

      this.context.stdout.write(stringify(resp) + '\n');
    } else {
      const resp = await client
        .url(`/namespaces/foo/${kind}/${name}`)
        .get()
        .json();

      this.context.stdout.write(stringify(resp) + '\n');
    }
  }
}
