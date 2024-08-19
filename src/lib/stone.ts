import { attr, css, element, html } from "@joist/element";

export type StoneColor = "black" | "white";

export class StoneAddedEvent extends Event {
  stone;

  constructor(stone: GoStoneElement) {
    super("stoneadded", { bubbles: true });

    this.stone = stone;
  }
}

export class StoneRemovedEvent extends Event {
  stone;

  constructor(stone: GoStoneElement) {
    super("stoneremoved", { bubbles: true });

    this.stone = stone;
  }
}

@element({
  tagName: "go-stone",
  shadow: [
    css`
      :host {
        box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.5);
        display: inline-flex;
        border-radius: 50%;
        height: 50px;
        width: 50px;
      }

      ::slotted(go-marker) {
        height: 75%;
        width: 75%;
      }

      :host([color="black"]) {
        color: #fff;
        background: black;
        background-image: radial-gradient(
          circle at center,
          rgba(255, 255, 255, 0.2),
          rgba(0, 0, 0, 0) 45%
        );
      }

      :host([color="white"]) {
        color: #000;
        background: #fff;
        background-image: radial-gradient(
          circle at center,
          rgba(0, 0, 0, 0),
          rgba(0, 0, 0, 0.15)
        );
      }
    `,
    html`<slot></slot>`,
  ],
})
export class GoStoneElement extends HTMLElement {
  static create(color: StoneColor, space: string = "") {
    const stone = new GoStoneElement();

    stone.color = color;
    stone.slot = space;

    return stone;
  }

  @attr()
  accessor color: StoneColor = "black";

  connectedCallback() {
    this.dispatchEvent(new StoneAddedEvent(this));
  }

  disconnectedCallback() {
    this.dispatchEvent(new StoneRemovedEvent(this));
  }
}
