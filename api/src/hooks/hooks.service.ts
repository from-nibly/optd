import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import { HookableResource } from 'src/resources/resources.types';
import { HookDatabase, HookError } from './hooks.types';
import { spawn } from 'child_process';
import { KindHookSpec } from 'src/meta/kinds/kinds.types';
import { DatabaseService } from 'src/database/databases.service';

interface HookResult {
  stdout: string;
  stderr: string;
  code: number;
}

@Injectable()
export class HooksService {
  private readonly logger = new Logger(HooksService.name);
  hooks: HookDatabase = {};

  constructor(private readonly database: DatabaseService) {}

  async obtainMaterializedHook(
    kind: string,
    event: keyof KindHookSpec,
  ): Promise<string | undefined> {
    //TODO: performance caching
    const [spec, ...extra] = await this.database
      .client('meta_kind')
      .where('name', kind)
      .select('spec');
    if (extra.length > 0) {
      throw new Error('multiple kinds with same name');
    }

    if (!spec) {
      throw new Error(`kind ${kind} not found`);
    }

    const script = spec.hooks?.[event];

    if (!script) {
      return undefined;
    }

    const dir = `/tmp/optdctl/hooks/${kind}`;
    await fs.mkdir(dir, { recursive: true });
    const filename = `${dir}/${event}`;

    await fs.writeFile(filename, script);
    await fs.chmod(filename, 0o700);

    return filename;
  }

  async executeHook(
    event: keyof KindHookSpec,
    kind: string,
    record: HookableResource,
    onError?: (err: HookError) => Promise<void>,
  ): Promise<HookResult | undefined> {
    this.logger.debug('executing event', event, record);
    const filename = await this.obtainMaterializedHook(kind, event);
    if (!filename) {
      return undefined;
    }

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
