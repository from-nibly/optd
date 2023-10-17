import { Command, Option } from 'clipanion';
import { parse, stringify } from 'yaml';

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

    const editor = process.env['EDITOR'] ?? 'vi';

    const bufferFileName = '/tmp/optdctl-buffer.yaml';
    const bufferFile = Bun.file(bufferFileName);

    await Bun.write(
      bufferFileName,
      stringify({
        metadata: { namespace: 'foo', name: '<changeme>', kind },
        spec: {},
      }),
    );

    const proc = Bun.spawn([editor, bufferFileName], {
      stdout: 'inherit',
      stdin: 'inherit',
      stderr: 'inherit',
    });

    await proc.exited;

    const output = await bufferFile.text();

    const outputObj = parse(output);

    this.context.stdout.write(JSON.stringify(outputObj, null, 2));
  }
}
