import { KindHookSpec } from 'src/meta/kinds/kinds.types';

export interface HookDatabase {
  [key: string]: KindHookSpec & { rev: string };
}

export class HookError extends Error {
  constructor(
    public hookName: string,
    public code: number,
    public stderr: string,
    public stdout: string,
  ) {
    super(`Hook [${hookName}] failed`);
  }
}
