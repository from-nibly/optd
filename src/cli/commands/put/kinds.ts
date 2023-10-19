import { Command } from 'clipanion';

export class PutKindCommand extends Command {
  static paths = [['put', 'kind']];
  static usage = Command.Usage({
    category: 'Configuration',
    description: 'Put a kind',
    details: `
      This command will create or update a kind.
    `,
    examples: [['Create or update a kind', 'optdctl put kind <kind>']],
  });

  async execute(): Promise<number | void> {}
}
