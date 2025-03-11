export class StonePlacedEvent extends Event {
  constructor() {
    super("stone-placed");
  }
}

export class StonesCapturedEvent extends Event {
  count;

  constructor(count: number) {
    super("stones-captured");

    this.count = count;
  }
}

declare global {
  interface HTMLElementEventMap {
    "stone-placed": StonePlacedEvent;
    "stones-captured": StonesCapturedEvent;
  }
}
