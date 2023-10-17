import { Command, Option } from 'clipanion';
import { parse, stringify } from 'yaml';
import { client } from '../../client';

export class PutResourceCommand extends Command {
  static paths = [['put'], ['p']];
  static usage = Command.Usage({
    category: 'Resources',
    description: 'Create or update a resource',
    examples: [
      ['Create a resource by using your editor', 'optdctl put versions'],
      [
        'Create a resource using inline json',
        `optdctl put versions --data '{...}'`,
      ],
    ],
  });

  data = Option.String('-d,--data', { required: false });
  kind = Option.String();
  name = Option.String({ required: false });

  async execute(): Promise<number | void> {
    let kind = this.kind;
    let name = this.name;
    let rest = [];

    if (name === undefined && kind.indexOf('/') !== -1) {
      [kind, name, ...rest] = kind.split('/');
    }
    const outputObj = await this.obtainData(name, kind);

    outputObj.metadata ??= {};
    outputObj.metadata.name ??= name;
    const namespace = outputObj.metadata.namespace ?? 'foo';

    delete outputObj.metadata.namespace;
    delete outputObj.metadata.kind;

    const resp = await client
      .url(`/namespaces/${namespace}/${kind}`)
      .json(outputObj)
      .put();

    this.context.stdout.write(stringify(await resp.json()) + '\n');
  }

  //TODO: what type is this? PutResource?
  async obtainData(name: string | undefined, kind: string): Promise<any> {
    if (this.data) {
      return JSON.parse(this.data);
    }

    const editor = process.env['EDITOR'] ?? 'vi';

    //TODO: there's no way this is gonna work universally
    const bufferFileName = '/tmp/optdctl-buffer.yaml';
    const bufferFile = Bun.file(bufferFileName);

    await Bun.write(
      bufferFileName,
      stringify({
        metadata: { namespace: 'foo', name: name ?? '<changeme>', kind },
        spec: {},
      }),
    );

    const proc = Bun.spawn([editor, bufferFileName], {
      stdout: 'inherit',
      stdin: 'inherit',
      stderr: 'inherit',
    });

    //TODO: catch errors?
    await proc.exited;

    const output = await bufferFile.text();
    //TODO: validation of some kind?
    return parse(output);
  }
}
