import { Command } from 'clipanion';
import { parse, stringify } from 'yaml';

export abstract class EditCommand extends Command {
  //TODO: what type is this? PutResource?
  async obtainData(existing: any): Promise<any> {
    const editor = process.env['EDITOR'] ?? 'vi';
    console.log('existing', existing);

    const bufferFileName = `/tmp/optdctl-buffer-${
      existing.metadata.name
    }-${new Date().toISOString()}.yaml`;
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
