import { Builtins, Cli } from 'clipanion';
import { GetResourceCommand } from './commands/get/resources';
import { PutResourceCommand } from './commands/put/resources';
import { EditResourceCommand } from './commands/edit/resources';
import { GetKindCommand } from './commands/get/kinds';
import { PutKindCommand } from './commands/put/kinds';
import { EditKindCommand } from './commands/edit/kinds';
import { PutSubjectCommand } from './commands/put/subjects';
import { AuthLoginCommand } from './commands/auth/login';
import { ConfigService } from './config/config.service';
import { container } from 'tsyringe';
import { DirectoryService } from './config/directory.service';
import { ClientService } from './client';
import { GetSubjectCommand } from './commands/get/subjects';
import { EditSubjectCommand } from './commands/edit/subjects';
import { PutRoleCommand } from './commands/put/roles';
import { GetRoleCommand } from './commands/get/roles';
import { EditRoleCommand } from './commands/edit/roles';
import { PutGroupCommand } from './commands/put/groups';
import { EditGroupCommand } from './commands/edit/groups';
import { GetGroupCommand } from './commands/get/groups';
import { PutCronCommand } from './commands/put/crons';
import { EditCronCommand } from './commands/edit/crons';
import { GetCronCommand } from './commands/get/crons';
import { GetResourceHistoryCommand } from './commands/history/resources';

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
cli.register(PutSubjectCommand);
cli.register(AuthLoginCommand);
cli.register(GetSubjectCommand);
cli.register(EditSubjectCommand);
cli.register(PutRoleCommand);
cli.register(GetRoleCommand);
cli.register(EditRoleCommand);
cli.register(PutGroupCommand);
cli.register(EditGroupCommand);
cli.register(GetGroupCommand);
cli.register(PutCronCommand);
cli.register(EditCronCommand);
cli.register(GetCronCommand);
cli.register(GetResourceHistoryCommand);

cli.register(Builtins.HelpCommand);
cli.register(Builtins.VersionCommand);

cli.runExit(args);
