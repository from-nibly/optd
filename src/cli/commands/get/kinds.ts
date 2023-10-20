import { Command, Option } from 'clipanion';
import { client } from '../../client';
import { stringify } from 'yaml';

export class GetKindCommand extends Command {
  static paths = [
    ['get', 'kind'],
    ['g', 'kind'],
    ['get', 'kinds'],
    ['g', 'kinds'],
  ];
  static usage = Command.Usage({
    category: 'Configuration',
    description: 'List or get Kinds',
    details: `
      This command will List or get Kinds.
    `,
    examples: [
      ['List all kinds', 'optdctl get kind'],
      ['Get a single kind', 'optdctl get kind <kind-name>'],
    ],
  });

  name = Option.String({ required: false });

  async execute(): Promise<number | void> {
    if (this.name) {
      const resp = await client.url(`/meta/kind/${this.name}`).get().json();
      this.context.stdout.write(stringify(resp) + '\n');
      return;
    }
    const resp = await client.url('/meta/kind').get().json();
    this.context.stdout.write(stringify(resp) + '\n');
  }
}
