import { Builtins, Cli, Command, Option, runExit } from 'clipanion';
import wretch from 'wretch';
import { stringify } from 'yaml';

const [node, app, ...args] = process.argv;

const client = wretch('http://localhost:3000');

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

const cli = new Cli({
  binaryLabel: 'optdctl',
  binaryName: 'optdctl',
  binaryVersion: '0.0.1',
});

cli.register(GetCommand);
cli.register(Builtins.HelpCommand);
cli.register(Builtins.VersionCommand);

cli.runExit(args);
