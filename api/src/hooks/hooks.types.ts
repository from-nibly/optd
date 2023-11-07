import { KindHookSpec } from 'src/kinds/kinds.types';

export interface HookDatabase {
  [key: string]: KindHookSpec;
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