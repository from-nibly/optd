import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import * as fs from 'fs/promises';
import { DatabaseService } from 'src/database/databases.service';
import { v4 as uuid } from 'uuid';

//TODO: maybe save the environment and the script in the database?
interface OutputLine {
  t: string;
  v: string;
}
export interface ExecutionResult {
  stdout: OutputLine[];
  stderr: OutputLine[];
  code: number;
}

@Injectable()
export class ExecutorService {
  private logger = new Logger(ExecutorService.name);
  constructor(private readonly dbService: DatabaseService) {}

  private async materializeContext(
    kind: string,
    event: string,
    script: string,
    payload: Record<string, unknown>,
  ): Promise<string> {
    const dir = `/tmp/optdctl/scripts/${kind}/${event}`;
    await fs.mkdir(dir, { recursive: true });

    //script
    const scriptFile = `${dir}/script`;
    await fs.writeFile(scriptFile, script);
    await fs.chmod(scriptFile, 0o700);

    //payload
    const payloadFile = `${dir}/payload`;
    await Promise.all(
      Object.entries(payload).reduce(
        (prev: Promise<unknown>[], [key, value]) => {
          prev.push(fs.writeFile(`${dir}/${key}`, JSON.stringify(value)));
          return prev;
        },
        [] as Promise<unknown>[],
      ),
    );

    return dir;
  }

  async executeScript(
    script: string,
    script_revision: string,
    event: string,
    kind: string,
    payload: Record<string, unknown>,
  ): Promise<ExecutionResult | undefined> {
    this.logger.debug('executing event', { event, kind });
    //TODO: do we need the old version?
    const dir = await this.materializeContext(kind, event, script, payload);
    this.logger.debug('created script context', { dir });

    return new Promise<ExecutionResult>((resolve, reject) => {
      const env_with_extra_path = {
        ...process.env,
        //TODO: fix path to be dynamic
        PATH: `${process.env.PATH}:/home/jdavidson/gh/from-nibly/optd-old/tools/src`,
      };
      const proc = spawn(`${dir}/script`, {
        stdio: 'pipe',
        cwd: dir,
        env: env_with_extra_path,
      });
      const stdout: OutputLine[] = [];
      const stderr: OutputLine[] = [];
      let stdoutText = '';
      let stderrText = '';

      proc.stdout.on('data', (data) => {
        stdoutText += data;
        if (stdoutText.includes('\n')) {
          const lines = stdoutText.split('\n');
          stdoutText = lines.pop()!;
          for (const line of lines) {
            stdout.push({ t: new Date().toISOString(), v: line });
          }
        }
      });
      proc.stderr.on('data', (data) => {
        stderrText += data;
        if (stderrText.includes('\n')) {
          const lines = stderrText.split('\n');
          stderrText = lines.pop()!;
          for (const line of lines) {
            stderr.push({ t: new Date().toISOString(), v: line });
          }
        }
      });

      proc.on('exit', (code) => {
        try {
          const resp = { stdout, stderr, code: code ?? 1 };
          this.logger.debug('execution finished', { resp });

          const dbRecord = {
            id: uuid(),
            started_at: new Date().toISOString(),
            ended_at: new Date().toISOString(),
            stdout: { entries: stdout },
            stderr: { entries: stderr },
            exit_code: code,
            script_revision: script_revision,
            event_name: event,
            payload,
          };

          const query = this.dbService
            .client(this.dbService.getExecutionHistoryTableName(kind))
            .insert(dbRecord);

          query
            .then(() => {
              resolve(resp);
            })
            .catch((err) => {
              this.logger.error('failed to insert execution history', {
                err,
                query: query.toQuery(),
              });
              reject(err);
            });
        } catch (err) {
          reject(err);
        }
      });
    });
  }
}
