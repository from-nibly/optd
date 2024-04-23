import { Builtins, Cli } from 'clipanion';
import { GetResourceCommand } from './commands/get/resources';
import { PutResourceCommand } from './commands/put/resources';
import { EditResourceCommand } from './commands/edit/resources';
import { GetKindCommand } from './commands/get/kinds';
import { PutKindCommand } from './commands/put/kinds';
import { EditKindCommand } from './commands/edit/kinds';
import { PutsubjectCommand } from './commands/put/subjects';
import { AuthLoginCommand } from './commands/auth/login';
import { ConfigService } from './config/config.service';
import { container } from 'tsyringe';
import { DirectoryService } from './config/directory.service';
import { ClientService } from './client';

const [node, app, ...args] = process.argv;

const cli = new Cli({
  binaryLabel: 'optdctl',
  binaryName: 'optdctl',
  binaryVersion: '0.0.1',
});

container.register(ConfigService, { useClass: ConfigService });
container.register(DirectoryService, { useClass: DirectoryService });
container.register(ClientService, { useClass: ClientService });
container.register(GetResourceCommand, { useClass: GetResourceCommand });

cli.register(GetResourceCommand);
cli.register(PutResourceCommand);
cli.register(EditResourceCommand);
cli.register(GetKindCommand);
cli.register(PutKindCommand);
cli.register(EditKindCommand);
cli.register(PutsubjectCommand);
cli.register(AuthLoginCommand);

cli.register(Builtins.HelpCommand);
cli.register(Builtins.VersionCommand);

cli.runExit(args);
