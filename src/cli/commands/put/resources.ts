import { Command, Option } from 'clipanion';
import { parse, stringify } from 'yaml';
import { client } from '../../client';
import { PutCommand } from './root';

export class PutResourceCommand extends PutCommand {
  static paths = [['put'], ['p']];
  static usage = Command.Usage({
    category: 'Resources',
    description: 'Create or update a resource',
    examples: [
      ['Create a resource by using your editor', 'optdctl put <kind>'],
      [
        'Create or update a resource by using your editor',
        'optdctl put <kind>/<name>',
      ],
      [
        'Create or update a resource from a file',
        'optdctl put <kind> -f <file>',
      ],
      [
        'Create or update a resource from stdin',
        'cat <file> | optdctl put <kind> -f -',
      ],
    ],
  });

  kind = Option.String({ required: true });
  name = Option.String({ required: false });

  async execute(): Promise<number | void> {
    let kind = this.kind;
    let name = this.name;
    let rest = [];

    if (name === undefined && kind.indexOf('/') !== -1) {
      [kind, name, ...rest] = kind.split('/');
    }
    const outputObj = await this.obtainData(name, kind, 'foo');

    outputObj.metadata ??= {};
    outputObj.metadata.name ??= name;
    const namespace = outputObj.metadata.namespace ?? 'foo';

    delete outputObj.metadata.namespace;
    delete outputObj.metadata.kind;

    await client
      .url(`/namespaces/${namespace}/${kind}`)
      .json(outputObj)
      .put()
      .badRequest((res) => {
        const resp = res.json;
        this.context.stdout.write(resp.hook + ' hook failed\n');
        if (resp.stdout) {
          this.context.stdout.write('stdout:\n' + resp.stdout);
        }
        if (resp.stderr) {
          this.context.stdout.write('stderr:\n' + resp.stderr);
        }
      })
      .res(async (response) => {
        this.context.stdout.write(stringify(await response.json()) + '\n');
      });
  }
}
