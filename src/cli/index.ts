import { Builtins, Cli } from 'clipanion';
import { GetCommand } from './commands/get/resources';

const [node, app, ...args] = process.argv;

const cli = new Cli({
  binaryLabel: 'optdctl',
  binaryName: 'optdctl',
  binaryVersion: '0.0.1',
});

cli.register(GetCommand);
cli.register(Builtins.HelpCommand);
cli.register(Builtins.VersionCommand);

cli.runExit(args);
