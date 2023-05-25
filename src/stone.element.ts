import { attr, css, tagName, shadow } from "@joist/element";

import { GoBoardElement } from "./board.element.js";

export type StoneColor = "black" | "white";

export class GoStoneElement extends HTMLElement {
  static create(color: StoneColor, space: string = "") {
    const stone = new GoStoneElement();

    stone.color = color;
    stone.slot = space;

    return stone;
  }

  @tagName static tagName = "go-stone";

  @shadow styles = css`
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
  `;

  @attr accessor color: StoneColor = "black";

  #parent: GoBoardElement | null = null;

  connectedCallback() {
    if (this.parentElement instanceof GoBoardElement) {
      this.#parent = this.parentElement;
      this.#parent.onStoneAdded(this);
    }
  }

  disconnectedCallback() {
    this.#parent?.onStoneRemoved(this);
    this.#parent = null;
  }
}
