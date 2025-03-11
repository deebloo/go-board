import { inject, injectable } from "@joist/di";
import { attr, css, element, html } from "@joist/element";

import { GoBoardContext } from "../util/context.js";

export type StoneColor = "black" | "white";

@injectable({
  name: "go-stone-ctx",
})
@element({
  tagName: "go-stone",
  shadowDom: [
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
  @attr()
  accessor color: StoneColor = "black";

  #ctx = inject(GoBoardContext);

  connectedCallback() {
    const ctx = this.#ctx();

    ctx.registerStone(this);
  }

  disconnectedCallback() {
    const ctx = this.#ctx();

    ctx.unregisterStone(this);
  }
}
