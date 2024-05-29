import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import * as fs from 'fs/promises';

//TODO: maybe save the environment and the script in the database?
interface ExecutionResult {
  stdout: string;
  stderr: string;
  code: number;
}

@Injectable()
export class ExecutorService {
  private logger = new Logger(ExecutorService.name);
  constructor() {}

  private async materializeScript(
    kind: string,
    event: string,
    script: string,
  ): Promise<string> {
    const dir = `/tmp/optdctl/scripts/${kind}`;
    await fs.mkdir(dir, { recursive: true });
    const filename = `${dir}/${event}`;

    await fs.writeFile(filename, script);
    await fs.chmod(filename, 0o700);

    return filename;
  }

  private async materializeContext(
    kind: string,
    event: string,
    script: string,
    payload: string,
  ): Promise<string> {
    const dir = `/tmp/optdctl/scripts/${kind}/${event}`;
    await fs.mkdir(dir, { recursive: true });

    //script
    const scriptFile = `${dir}/script`;
    await fs.writeFile(scriptFile, script);
    await fs.chmod(scriptFile, 0o700);

    //payload
    const payloadFile = `${dir}/payload`;
    await fs.writeFile(payloadFile, JSON.stringify(payload));

    return dir;
  }

  async executeScript(
    script: string,
    event: string,
    kind: string,
    payload: any,
  ): Promise<ExecutionResult | undefined> {
    this.logger.debug('executing event', { event, kind });
    //TODO: do we need the old version?
    const dir = await this.materializeContext(kind, event, script, payload);
    this.logger.debug('created script context', { dir });

    return new Promise<ExecutionResult>((resolve, reject) => {
      const proc = spawn(`${dir}/script`, { stdio: 'pipe', cwd: dir });
      let stdout = '';
      let stderr = '';

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
          resolve({ stdout, stderr, code: code! });
        }
      });
    });
  }
}
