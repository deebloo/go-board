import { css, styled } from "@joist/styled";
import { observable, observe, attr } from "@joist/observable";
import { GoBoardElement } from "./board.element";

export type StoneColor = "black" | "white";

@observable
@styled
export class GoStoneElement extends HTMLElement {
  static create(color: StoneColor, slot: string = "") {
    const stone = new GoStoneElement();

    stone.color = color;
    stone.slot = slot;

    return stone;
  }

  static styles = [
    css`
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
  ];

  @observe @attr color: StoneColor = "black";
  @observe @attr space: string = "";

  #parent: GoBoardElement | null = null;

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    if (!this.space) {
      this.space = this.slot;
    }

    if (this.parentElement instanceof GoBoardElement) {
      this.#parent = this.parentElement;

      this.#parent.onStoneAdded(this);
    }
  }

  attributeChangedCallback(key: string) {
    if (key === "slot") {
      this.space = this.slot;
    }
  }
}
