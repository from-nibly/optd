import { Command, Option, runExit } from 'clipanion';
import wretch from 'wretch';
import { parse, stringify } from 'yaml';

const client = wretch('http://localhost:3000');

export class GetCommand extends Command {
  static paths = [['get'], ['g']];
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
      //execute get all
      const resp = await client.url(`/namespaces/foo/${kind}`).get().json();
      this.context.stdout.write(stringify(resp) + '\n');
    } else {
      //execute get one
      const resp = await client
        .url(`/namespaces/foo/${kind}/${name}`)
        .get()
        .json();
      this.context.stdout.write(stringify(resp) + '\n');
    }
  }
}

runExit(GetCommand);
