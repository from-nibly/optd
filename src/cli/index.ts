import { Builtins, Cli } from 'clipanion';
import { GetCommand } from './commands/get/resources';
import { PutResourceCommand } from './commands/put/resources';

const [node, app, ...args] = process.argv;

const cli = new Cli({
  binaryLabel: 'optdctl',
  binaryName: 'optdctl',
  binaryVersion: '0.0.1',
});
console.log('found stuff', process.argv);

cli.register(GetCommand);
cli.register(PutResourceCommand);
cli.register(Builtins.HelpCommand);
cli.register(Builtins.VersionCommand);

cli.runExit(args);
