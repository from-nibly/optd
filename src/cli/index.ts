import { Builtins, Cli } from 'clipanion';
import { GetResourceCommand } from './commands/get/resources';
import { PutResourceCommand } from './commands/put/resources';
import { EditResourceCommand } from './commands/edit/resources';

const [node, app, ...args] = process.argv;

const cli = new Cli({
  binaryLabel: 'optdctl',
  binaryName: 'optdctl',
  binaryVersion: '0.0.1',
});

cli.register(GetResourceCommand);
cli.register(PutResourceCommand);
cli.register(EditResourceCommand);
cli.register(Builtins.HelpCommand);
cli.register(Builtins.VersionCommand);

cli.runExit(args);
