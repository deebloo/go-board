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

  group(...label: any[]) {
    if (this.config().debug) {
      console.group(...label);
    }
  }

  groupEnd() {
    if (this.config().debug) {
      console.groupEnd();
    }
  }

  log(...args: any[]) {
    this.eval(() => {
      console.log("DEBUG:", ...args);
    });
  }

  eval(fn: () => void) {
    if (this.config().debug) {
      fn();
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
