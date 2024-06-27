import { Command, Option } from 'clipanion';
import { parse, stringify } from 'yaml';
import { EditCommand } from './root';
import { ClientService } from '../../client';
import { autoInjectable } from 'tsyringe';

@autoInjectable()
export class EditResourceCommand extends EditCommand {
  static paths = [['edit'], ['e']];
  static usage = Command.Usage({
    category: 'Resources',
    description: 'edit an existing resource',
    examples: [
      ['Edit a resource by using your editor', 'optdctl edit <kind>/<name>'],
      ['Edit a resource by using your editor', 'optdctl edit <kind> <name>'],
    ],
  });

  private readonly clientService: ClientService;

  constructor(clientService?: ClientService) {
    super();
    this.clientService = clientService!;
  }

  kind = Option.String({ required: true });
  name = Option.String({ required: false });

  async execute(): Promise<number | void> {
    const client = await this.clientService.getClient();
    let kind = this.kind;
    let name = this.name;

    if (name === undefined && kind.indexOf('/') !== -1) {
      [kind, name] = kind.split('/');
    }

    if (name === undefined) {
      throw new Error('name is required');
    }

    const existing = await client
      .url(`/namespaces/foo/resources/${kind}/${name}`)
      .get()
      .json();

    //TODO: validation?
    const outputObj = await this.obtainData(existing as any);

    if (stringify(outputObj) === stringify(existing)) {
      this.context.stdout.write('No changes detected\n');
      return 0;
    }

    outputObj.metadata ??= {};
    outputObj.metadata.name ??= name;
    const namespace = outputObj.metadata.namespace ?? 'foo';

    await client
      .url(`/namespaces/${namespace}/resources/${kind}/${name}`)
      .json(outputObj)
      .put()
      .badRequest((res) => {
        const resp = res.json;
        this.context.stdout.write(resp.hook + ' hook failed\n');
        if (resp.stdout) {
          this.context.stdout.write('stdout:\n' + resp.stdout);
        }
        if (resp.stderr) {
          this.context.stdout.write('stderr:\n' + resp.stderr);
        }
      })
      .res(async (response) => {
        this.context.stdout.write(stringify(await response.json()) + '\n');
      });
  }
}
