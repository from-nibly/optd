import { Command, Option, runExit } from 'clipanion';

export class GetCommand extends Command {
  name = Option.String('-n,--name', { required: true });

  async execute(): Promise<number | void> {
    this.context.stdout.write(`Hello, world!  ${this.name}\n`);
  }
}

runExit(GetCommand);
