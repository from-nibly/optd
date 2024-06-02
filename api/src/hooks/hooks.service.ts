import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/databases.service';
import {
  ExecutionResult,
  ExecutorService,
} from 'src/executor/executor.service';
import { Kind, KindHookSpec, KindSpec } from 'src/meta/kinds/kinds.types';
import { KindDBRecord } from 'src/meta/kinds/kinds.types.record';
import { ActorContext } from 'src/types/types';
import { HookDatabase, HookError } from './hooks.types';

interface HookResult {
  stdout: string;
  stderr: string;
  code: number;
}

@Injectable()
export class HooksService {
  private readonly logger = new Logger(HooksService.name);
  hooks: HookDatabase = {};

  constructor(
    private readonly dbService: DatabaseService,
    private readonly executorService: ExecutorService,
  ) {}

  async executeHook(
    actorContext: ActorContext,
    kind: string,
    event: keyof KindHookSpec,
    //TODO: need to break this method out into multiple methods so types can be exact
    payload: any,
    resourceName: string,
    onError?: (err: HookError) => Promise<void>,
  ): Promise<ExecutionResult | undefined> {
    this.logger.debug('executing event', { event, record: payload });

    const [kindRecord, ...extra] =
      await this.dbService.getResourceInternal<KindDBRecord>(Kind.kind, kind);

    this.logger.debug('found kind record?', { kindRecord });

    if (kindRecord === undefined) {
      return undefined;
    }

    this.logger.debug('found kind record', { kindRecord });

    const spec = kindRecord.spec as KindSpec;

    const script = spec.hooks?.[event];

    if (!script) {
      return undefined;
    }
    this.logger.debug('found hook script', { script, event });

    return this.executorService
      .executeScript(script, kindRecord.revision_id, event, kind, payload)
      .catch((err) => {
        this.logger.error('hook failed', err);
        if (onError) {
          onError(err);
        }
        throw err;
      });
  }
}
