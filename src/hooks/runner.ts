import fs from 'node:fs/promises';
import { HookSpec } from '../types/kinds';

interface HookDatabase {
  [key: string]: HookSpec;
}

export class HookError extends Error {
  constructor(
    public hookName: string,
    public code: number,
    public stderr: string,
    public stdout: string,
  ) {
    super(`Hook ${hookName} failed`);
  }
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

  async executeHook(
    event: keyof HookSpec,
    kind: string,
    //TODO: what kind of type checking do I want here?
    record: any,
  ): Promise<{ stdout: string; stderr: string; code: number }> {
    console.log('executing event', event, record);
    const script = this.hooks[kind]?.[event];
    if (!script) {
      console.log('no script found for event', event, kind);
      return { code: 0, stdout: '', stderr: '' };
    }

    const dir = `/tmp/optdctl/hooks/${kind}`;
    await fs.mkdir(dir, { recursive: true });
    const filename = `${dir}/${event}`;

    await Bun.write(filename, script);
    await fs.chmod(filename, 0o700);

    const proc = Bun.spawn([filename], { stdin: 'pipe', stderr: 'pipe' });

    proc.stdin.write(JSON.stringify(record));
    //TODO: what do these return?
    await proc.stdin.flush();
    await proc.stdin.end();

    await proc.exited;
    console.log('Event Completed with exit code', proc.exitCode);
    //TODO: logging framework?
    let stdout = '';
    let stderr = '';

    if (proc.stdout) {
      stdout = await Bun.readableStreamToText(proc.stdout);
    }
    if (proc.stderr) {
      stderr = await Bun.readableStreamToText(proc.stderr);
    }
    console.log(stdout);
    console.log(stderr);

    const result = {
      code: proc.exitCode ?? -1,
      stdout,
      stderr,
    };
    if (result.code !== 0) {
      throw new HookError(event, result.code, result.stderr, result.stdout);
    }
    return result;
  }
}
