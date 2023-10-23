import { Command } from 'clipanion';
import { parse, stringify } from 'yaml';
import { Resource } from '../../../types/root';

export abstract class EditCommand extends Command {
  //TODO: what type is this? PutResource?
  async obtainData(existing: Resource): Promise<any> {
    const editor = process.env['EDITOR'] ?? 'vi';

    //TODO: there's no way this is gonna work universally
    const bufferFileName = '/tmp/optdctl-buffer.yaml';
    const bufferFile = Bun.file(bufferFileName);

    await Bun.write(bufferFileName, stringify(existing));

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
