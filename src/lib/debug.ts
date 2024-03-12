export class Debug {
  #debug = false;

  group(...label: any[]) {
    if (this.#debug) {
      console.group(...label);
    }
  }

  groupEnd() {
    if (this.#debug) {
      console.groupEnd();
    }
  }

  log(...args: any[]) {
    this.eval(() => {
      console.log("DEBUG:", ...args);
    });
  }

  eval(fn: () => void) {
    if (this.#debug) {
      fn();
    }
  }

  enable() {
    this.#debug = true;
  }

  disable() {
    this.#debug = false;
  }
}

export class NoopDebug extends Debug {
  group(..._: any[]) {}
  groupEnd() {}
  log(..._: any[]) {}
  eval(_: () => void) {}
  enable() {}
  disable() {}
}
