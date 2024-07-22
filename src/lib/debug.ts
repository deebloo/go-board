export class Debug {
  enabled = false;
  group(..._: any[]) {}
  groupEnd() {}
  log(..._: any[]) {}
}

export class ConsoleDebug implements Debug {
  enabled = true;

  group(...label: any[]) {
    console.group(...label);
  }

  groupEnd() {
    console.groupEnd();
  }

  log(...args: any[]) {
    console.log("DEBUG:", ...args);
  }
}
