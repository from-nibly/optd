import { Command, Option } from 'clipanion';
import { parse, stringify } from 'yaml';
import { client } from '../../client';
import { Resource } from '../../../types/root';
import { EditCommand } from './root';

export class EditResourceCommand extends EditCommand {
  static paths = [['edit'], ['e']];
  static usage = Command.Usage({
    category: 'Resources',
    description: 'edit an existing resource',
    examples: [
      ['Edit a resource by using your editor', 'optdctl edit <kind>/<name>'],
      ['Edit a resource by using your editor', 'optdctl edit <kind> <name>'],
    ],
  });

  kind = Option.String({ required: true });
  name = Option.String({ required: false });

  async execute(): Promise<number | void> {
    let kind = this.kind;
    let name = this.name;

    if (name === undefined && kind.indexOf('/') !== -1) {
      [kind, name] = kind.split('/');
    }

    if (name === undefined) {
      throw new Error('name is required');
    }

    const existing = await client
      .url(`/namespaces/foo/${kind}/${name}`)
      .get()
      .json();

    //TODO: validation?
    const outputObj = await this.obtainData(existing as any);

    if (stringify(outputObj) === stringify(existing)) {
      this.context.stdout.write('No changes detected\n');
      return 0;
    }

    outputObj.metadata ??= {};
    outputObj.metadata.name ??= name;
    const namespace = outputObj.metadata.namespace ?? 'foo';

    delete outputObj.metadata.namespace;
    delete outputObj.metadata.kind;

    const { history, ...rest } = outputObj as Resource;

    const resp = await client
      .url(`/namespaces/${namespace}/${kind}`)
      .json(rest)
      .put();

    this.context.stdout.write(stringify(await resp.json()) + '\n');
  }
}
