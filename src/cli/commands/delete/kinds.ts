import { Command, Option } from 'clipanion';
import { client } from '../../client';
import { DeleteCommand } from './root';

export class DeleteKindCommand extends DeleteCommand {
  static paths = [
    ['delete', 'kind'],
    ['d', 'kind'],
    ['delete', 'k'],
    ['d', 'k'],
  ];
  static usage = Command.Usage({
    category: 'Configuration',
    description: 'Delete an existing kind',
    examples: [['Delete a kind', 'optdctl delete <kind>']],
  });

  kind = Option.String({ required: true });

  async execute(): Promise<number | void> {
    let kind = this.kind;

    const confirm = this.confirmDelete(`${kind}/${name}`);

    if (!confirm) {
      return 0;
    }

    await client.url(`/meta/kinds/${kind}`).delete();
  }
}
