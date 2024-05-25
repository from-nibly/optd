import { Logger, Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/databases.module';
import { ExecutorService } from './executor.service';
import fs from 'fs/promises';
import { spawn } from 'child_process';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [],
  exports: [ExecutorService],
})
export class ExecutorModule {
  private logger = new Logger(ExecutorModule.name);

  private async obtainMaterializedScript(
    kind: string,
    event: string,
    script: string,
  ): Promise<string | undefined> {
    const dir = `/tmp/optdctl/scripts/${kind}`;
    await fs.mkdir(dir, { recursive: true });
    const filename = `${dir}/${event}`;

    await fs.writeFile(filename, script);
    await fs.chmod(filename, 0o700);

    return filename;
  }

  async executeScript(
    script: string,
    event: string,
    kind: string,
  ): Promise<HookResult | undefined> {
    this.logger.debug('executing event', { event, record });
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
          this.logger.debug('hook succeeded', { event, stdout, stderr });
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
