import { HookSpec, Kind, PutKind } from '../types/kinds';
import { PutResource, Resource } from '../types/root';

interface HookDatabase {
  [key: string]: HookSpec;
}

export class HookRunner {
  hooks: HookDatabase = {};

  configureHooks(kind: string, hooks: HookSpec) {
    this.hooks[kind] ??= {};

    //clear old hooks
    this.hooks[kind] = {};

    if (hooks) {
      let hook: keyof HookSpec;
      for (hook in hooks) {
        this.hooks[kind][hook] = hooks[hook];
      }
    }
  }

  executeEvent(event: keyof HookSpec, record: PutResource | Resource) {
    console.log('executing event', event, record);
  }
}
