import { Injected, service } from "@joist/di";
import { injectable } from "@joist/di/dom";

@service
export class GoConfig {
  debug = false;
}

@service
export class Debug {
  static inject = [GoConfig];

  constructor(private config: Injected<GoConfig>) {}

  log(...args: any[]) {
    if (this.config().debug) {
      console.log(...args);
    }
  }
}

@injectable
export class DebugCtxElement extends HTMLElement {
  static providers = [
    Debug,
    {
      provide: GoConfig,
      use: class extends GoConfig {
        debug = true;
      },
    },
  ];
}
