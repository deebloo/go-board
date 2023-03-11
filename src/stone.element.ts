import { GoBoardElement } from "./board.element.js";
import { css, shadow, ShadowTemplate } from "./templating.js";

export type StoneColor = "black" | "white";

const template: ShadowTemplate = {
  css: css`
    :host {
      box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.5);
      display: inline-flex;
      border-radius: 50%;
      height: 50px;
      width: 50px;
    }

    :host([color="black"]) {
      background: black;
      background-image: radial-gradient(
        circle at center,
        rgba(255, 255, 255, 0.2),
        rgba(0, 0, 0, 0) 45%
      );
    }

    :host([color="white"]) {
      background: #fff;
      background-image: radial-gradient(
        circle at center,
        rgba(0, 0, 0, 0),
        rgba(0, 0, 0, 0.15)
      );
    }
  `,
};

export class GoStoneElement extends HTMLElement {
  static create(color: StoneColor, slot: string = "") {
    const stone = new GoStoneElement();

    stone.color = color;
    stone.space = slot;

    return stone;
  }

  get color(): StoneColor {
    return (this.getAttribute("color") as StoneColor) || "black";
  }

  set color(value) {
    this.setAttribute("color", value);
  }

  get space() {
    return this.getAttribute("space") || "";
  }

  set space(val) {
    this.setAttribute("space", val);
  }

  #parent: GoBoardElement | null = null;

  constructor() {
    super();

    shadow(this, template);
  }

  connectedCallback() {
    if (this.parentElement instanceof GoBoardElement) {
      this.#parent = this.parentElement;
      this.#parent.onStoneAdded(this);
    }
  }
}
