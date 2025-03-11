export class Debug {
  enabled = false;
  group(..._: unknown[]) {}
  groupEnd() {}
  log(..._: unknown[]) {}
}

export class ConsoleDebug implements Debug {
  enabled = true;

  group(...label: unknown[]) {
    console.group(...label);
  }

  groupEnd() {
    console.groupEnd();
  }

  log(...args: unknown[]) {
    console.log("DEBUG:", ...args);
  }
}
