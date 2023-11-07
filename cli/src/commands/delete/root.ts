import { Command, Option } from 'clipanion';
import inquirer from 'inquirer';

export abstract class DeleteCommand extends Command {
  confirm = Option.Boolean('-y,--yes', { required: false });

  async confirmDelete(objectName: string): Promise<boolean> {
    const confirm: boolean =
      this.confirm ||
      (
        await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `Are you sure you want to delete ${objectName}?`,
          },
        ])
      ).confirm;

    if (this.confirm == true) {
      return true;
    }

    if (confirm == false) {
      this.context.stdout.write('Aborting\n');
    }

    return confirm;
  }
}
