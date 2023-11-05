import { Command, Option } from 'clipanion';
import { EditCommand } from './root';
import { client } from '../../client';
import { stringify } from 'yaml';
import { Resource } from '../../../types/root';

export class EditKindCommand extends EditCommand {
  static paths = [
    ['edit', 'kind'],
    ['e', 'kind'],
    ['edit', 'k'],
    ['e', 'k'],
  ];
  static usage = Command.Usage({
    category: 'Configuration',
    description: 'edit an existing kind',
    examples: [['Edit a kind by using your editor', 'optdctl edit <kind>']],
  });

  kind = Option.String({ required: true });

  async execute(): Promise<number | void> {
    let kind = this.kind;

    const existing = await client.url(`/meta/kinds/${kind}`).get().json();

    //TODO: type checking?
    const outputObj = await this.obtainData(existing as any);

    if (stringify(outputObj) === stringify(existing)) {
      this.context.stdout.write('No changes detected\n');
      return 0;
    }

    outputObj.metadata ??= {};

    delete outputObj.metadata.kind;

    const { history, ...rest } = outputObj as Resource;

    await client.url(`/meta/kinds/${kind}`).json(rest).put();
  }
}
