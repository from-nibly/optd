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

  server = Option.String('-s,--server', { required: false });
  username = Option.String('-u,--username', { required: false });
  password = Option.String('-p,--password', { required: false });
  name = Option.String('-n,--name', { required: false });

  private readonly configService: ConfigService;

  constructor(configService?: ConfigService) {
    super();
    this.configService = configService!;
  }

  private async obtainName(): Promise<string> {
    return (
      this.name ??
      (
        await inquirer.prompt([
          { type: 'input', name: 'name', message: 'Name for this server' },
        ])
      ).name
    );
  }

  private async obtainURL(): Promise<string> {
    let serverInput =
      this.server ??
      (
        await inquirer.prompt([
          { type: 'input', name: 'server', message: 'Server URL' },
        ])
      ).server;

    let serverURL = url.parse(serverInput);
    if (!serverURL.protocol?.startsWith('http')) {
      serverURL = url.parse(`http://${this.server}`);
    }
    return serverURL.href;
  }

  private async obtainUsername(): Promise<string> {
    return (
      this.username ??
      (
        await inquirer.prompt([
          {
            type: 'input',
            name: 'username',
            message: `Username`,
          },
        ])
      ).username
    );
  }

  private async obtainPassword(): Promise<string> {
    return (
      this.password ??
      (
        await inquirer.prompt([
          {
            type: 'password',
            name: 'password',
            message: `Password`,
          },
        ])
      ).password
    );
  }

  async execute(): Promise<number | void> {
    const name = await this.obtainName();

    const server = await this.configService.getServer(name);
    let serverURL: string;

    if (server) {
      serverURL = server.url;
    } else {
      serverURL = await this.obtainURL();
    }

    const username = await this.obtainUsername();
    const password = await this.obtainPassword();

    //TODO: ping the server to see if it exists

    const resp: any = await wretch(serverURL)
      .url('/auth/login')
      .post({
        username,
        password,
      })
      .json();

    await this.configService.writeServerConfig(
      name,
      serverURL,
      resp.access_token,
    );

    await this.configService.setCurrentServer(name);

    this.context.stdout.write(`Logged in\n${resp.access_token}\n`);
  }
}
