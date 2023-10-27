import { Command, Option } from 'clipanion';
import { EditCommand } from './root';
import { client } from '../../client';
import inquirer from 'inquirer';

export class DeleteResourceCommand extends EditCommand {
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

    const confirm: boolean =
      this.confirm ||
      (
        await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `Are you sure you want to delete ${kind}/${name}?`,
          },
        ])
      ).confirm;

    if (confirm === false) {
      this.context.stdout.write('Aborted\n');
      return 0;
    }

    await client.url(`/namespaces/foo/${kind}/${name}`).delete();
  }
}
