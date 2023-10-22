import { stdin } from 'bun';
import { HookSpec } from '../types/kinds';
import { CreateResource, Resource } from '../types/root';
import stream from 'stream';
import fs from 'node:fs/promises';

interface HookDatabase {
  [key: string]: HookSpec;
}

export class HookRunner {
  hooks: HookDatabase = {};

  configureHooks(kind: string, hooks: HookSpec) {
    console.log('configuring hooks', kind);
    this.hooks[kind] ??= {};

    //clear old hooks
    this.hooks[kind] = {};

    if (hooks) {
      let hook: keyof HookSpec;
      for (hook in hooks) {
        console.log(`adding hook ${kind}:${hook}`);
        this.hooks[kind][hook] = hooks[hook];
      }
    }
  }

  async executeEvent(event: keyof HookSpec, record: Resource): Promise<number> {
    console.log('executing event', event, record);
    const kind = record.metadata.kind;
    const script = this.hooks[kind]?.[event];
    if (!script) {
      console.log('no script found for event', event, kind);
      return -1;
    }

    const dir = `/tmp/optdctl/hooks/${kind}`;
    await fs.mkdir(dir, { recursive: true });
    const filename = `${dir}/${event}`;

    await Bun.write(filename, script);
    await fs.chmod(filename, 0o700);

    const proc = Bun.spawn([filename], { stdin: 'pipe' });

    proc.stdin.write(JSON.stringify(record));
    //TODO: what do these return?
    await proc.stdin.flush();
    await proc.stdin.end();

    await proc.exited;
    console.log(
      'event fired',
      proc.exitCode,
      await Bun.readableStreamToText(proc.stdout),
    );
    return proc.exitCode ?? -1;
  }
}
