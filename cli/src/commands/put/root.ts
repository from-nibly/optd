import { Command, Option } from 'clipanion';
import { parse, stringify } from 'yaml';

export abstract class PutCommand extends Command {
  file = Option.String('-f,--file', { required: false });

  //TODO: what type is this? PutResource?
  async obtainData(
    name: string | undefined,
    kind: string,
    namespace?: string,
  ): Promise<any> {
    if (this.file) {
      return this.obtainDataFromFile(name, kind, this.file);
    }
    return this.obtainDataFromEditor(name, kind, namespace);
  }

  async obtainDataFromFile(
    name: string | undefined,
    kind: string,
    fileName: string,
  ): Promise<any> {
    if (this.file == '-') {
      const stdin = Bun.file(0);
      return parse(await stdin.text());
    }
    const file = Bun.file(fileName);
    return parse(await file.text());
  }

  async obtainDataFromEditor(
    name: string | undefined,
    kind: string,
    namespace?: string,
  ): Promise<any> {
    const editor = process.env['EDITOR'] ?? 'vi';

    //TODO: there's no way this is gonna work universally
    const bufferFileName = '/tmp/optdctl-buffer.yaml';
    const bufferFile = Bun.file(bufferFileName);
    const templateObject = {
      metadata: {
        ...(namespace ? { namespace } : {}),
        name: name ?? '<changeme>',
        kind,
      },
      spec: {},
    };

    await Bun.write(bufferFileName, stringify(templateObject));

    const proc = Bun.spawn([editor, bufferFileName], {
      stdout: 'inherit',
      stdin: 'inherit',
      stderr: 'inherit',
    });

    //TODO: catch errors?
    const code = await proc.exited;

    const output = await bufferFile.text();

    if (stringify(templateObject) == output) {
      throw new Error('No changes made');
    }

    const outputObject = parse(output);

    //TODO: validation of some kind?
    return outputObject;
  }
}
