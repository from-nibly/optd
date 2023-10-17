import { Command } from 'clipanion';

export class ConfigureKindCommand extends Command {
  static paths = [['configure', 'kind']];
  static usage = Command.Usage({
    category: 'Configuration',
    description: 'Configure a kind',
    details: `
      This command will configure a kind.
    `,
    examples: [['Configure a kind', 'optdctl configure kind <kind>']],
  });

  async execute(): Promise<number | void> {}
}
