import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import { KindHookSpec } from 'src/kinds/kinds.types';
import { HookableResource } from 'src/resources/resources.types';
import { HookDatabase, HookError } from './hooks.types';
import { spawn } from 'child_process';

interface HookResult {
  stdout: string;
  stderr: string;
  code: number;
}

@Injectable()
export class HooksService {
  private readonly logger = new Logger(HooksService.name);
  hooks: HookDatabase = {};

  configureHooks(kind: string, revision: string, hooks: KindHookSpec) {
    this.logger.debug('configuring hooks', kind);
    //clear old hooks
    this.hooks[kind] = { rev: revision };

    if (hooks) {
      let hook: keyof KindHookSpec;
      for (hook in hooks) {
        this.logger.debug(`adding hook ${kind}:${hook}`);
        this.hooks[kind][hook] = hooks[hook];
      }
    }
  }

  async executeHook(
    event: keyof KindHookSpec,
    kind: string,
    record: HookableResource,
    onError?: (err: HookError) => Promise<void>,
  ): Promise<HookResult> {
    this.logger.debug('executing event', event, record);
    const script = this.hooks[kind]?.[event];
    if (!script) {
      this.logger.debug(`no script found for event ${event}:${kind}`);
      return { code: 0, stdout: '', stderr: '' };
    }

    const dir = `/tmp/optdctl/hooks/${kind}`;
    await fs.mkdir(dir, { recursive: true });
    const filename = `${dir}/${event}`;

    await fs.writeFile(filename, script);
    await fs.chmod(filename, 0o700);

    return new Promise<HookResult>((resolve, reject) => {
      const proc = spawn(filename, { stdio: 'pipe' });
      let stdout = '';
      let stderr = '';
      //TODO: do we need the old version?

      proc.stdin.write(JSON.stringify(record));
      proc.stdin.end();

      proc.stdout.on('data', (data) => {
        stdout += data;
      });
      proc.stderr.on('data', (data) => {
        stderr += data;
      });

      proc.on('exit', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr, code });
        } else {
          const error = new HookError(event, code ?? -1, stderr, stdout);
          //TODO: what if the rollback fails?
          if (onError) {
            onError(error).finally(() => reject(error));
          } else {
            reject(error);
          }
        }
      });
    });
  }
}
