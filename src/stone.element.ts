import { css, styled } from "@joist/styled";
import { observable, observe, attr } from "@joist/observable";

export type StoneColor = "black" | "white";

@observable
@styled
export class GoStoneElement extends HTMLElement {
  static styles = [
    css`
      :host {
        box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.2);
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
  @observe @attr space?: string;

  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this.addEventListener("dragstart", (e) => {
      e.dataTransfer!.setData("stone", this.slot);
      e.dataTransfer!.effectAllowed = "move";
    });
  }

  connectedCallback() {
    this.space = this.slot;
  }

  attributeChangedCallback(key: string) {
    if (key === "slot") {
      this.space = this.slot;
    }
  }
}
