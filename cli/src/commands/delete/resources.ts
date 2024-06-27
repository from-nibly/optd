import { Command, Option } from 'clipanion';
import { client } from '../../client';
import { DeleteCommand } from './root';

export class DeleteResourceCommand extends DeleteCommand {
  static paths = [['delete'], ['d']];
  static usage = Command.Usage({
    category: 'Resources',
    description: 'delete a resource',
    examples: [
      ['delete a resource', 'optdctl delete <kind>/<name>'],
      ['delete a resource', 'optdctl delete <kind> <name>'],
    ],
  });

  kind = Option.String({ required: true });
  name = Option.String({ required: false });
  confirm = Option.Boolean('-y,--yes', { required: false });

  async execute(): Promise<number | void> {
    let kind = this.kind;
    let name = this.name;

    if (name === undefined && kind.indexOf('/') !== -1) {
      [kind, name] = kind.split('/');
    }

    if (name === undefined) {
      throw new Error('name is required');
    }

    const confirm = this.confirmDelete(`${kind}/${name}`);

    if (!confirm) {
      return 0;
    }

    await client.url(`/namespaces/foo/resources/${kind}/${name}`).delete();
  }
}
