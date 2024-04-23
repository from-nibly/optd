import { Command, Option } from 'clipanion';
import inquirer from 'inquirer';
import url from 'url';
import { ConfigService } from '../../config/config.service';
import { autoInjectable } from 'tsyringe';
import wretch from 'wretch';

@autoInjectable()
export class AuthLoginCommand extends Command {
  static paths = [['auth', 'login']];
  static usage = Command.Usage({
    description: 'Log in to a server',
    examples: [['Log in to a server', 'optdctl auth login -s myserver']],
  });

  server = Option.String('-s,--server', { required: true });
  username = Option.String('-u,--username', { required: false });
  password = Option.String('-p,--password', { required: false });
  name = Option.String('-n,--name', { required: false });

  private readonly configService: ConfigService;

  constructor(configService?: ConfigService) {
    super();
    this.configService = configService!;
  }

  async execute(): Promise<number | void> {
    let serverURL = url.parse(this.server);
    if (!serverURL.protocol?.startsWith('http')) {
      serverURL = url.parse(`http://${this.server}`);
    }

    const nameInput =
      this.name ??
      (await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Name for this server',
        },
      ]));

    //TODO: ping the server to see if it exists
    const usernameInput =
      this.username ??
      (await inquirer.prompt([
        {
          type: 'input',
          name: 'username',
          message: `Username for ${serverURL.href}`,
        },
      ]));
    const passwordInput =
      this.password ??
      (await inquirer.prompt([
        {
          type: 'password',
          name: 'password',
          message: `Password for ${serverURL.href}`,
        },
      ]));

    const resp: any = await wretch(serverURL.href)
      .url('/auth/login')
      .post({
        username: usernameInput.username,
        password: passwordInput.password,
      })
      .json();

    await this.configService.writeServerConfig(
      nameInput.name,
      serverURL.href,
      resp.access_token,
    );

    await this.configService.setCurrentServer(nameInput.name);

    this.context.stdout.write(`Logged in\n${resp.access_token}\n`);
  }
}
