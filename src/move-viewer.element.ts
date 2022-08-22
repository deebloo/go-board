import { injectable } from "@joist/di";
import { attr, observable } from "@joist/observable";
import { css, styled } from "@joist/styled";
import { GoBoardElement } from "./board.element";
import { GoStoneElement } from "./stone.element";

@injectable
@styled
@observable
export class MoveViewerElement extends HTMLElement {
  static styles = [
    css`
      :host {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;
      }

      ::slotted(*) {
        height: 25px;
        width: 25px;
      }
    `,
  ];

  @attr for?: string;
  forElement: HTMLElement | null = null;

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = /*html*/ `<slot></slot>`;
  }

  connectedCallback() {
    if (this.for) {
      this.forElement = document.getElementById(this.for);

      if (this.forElement instanceof GoBoardElement) {
        this.forElement.childNodes.forEach((node) => {
          const copy = node.cloneNode() as HTMLElement;
          copy.slot = "";

          this.append(copy);
        });

        const observer = new MutationObserver((record) => {
          for (const mutation of record) {
            if (mutation.type === "childList") {
              mutation.addedNodes.forEach((node) => {
                const copy = node.cloneNode() as HTMLElement;
                copy.slot = "";

                this.append(copy);
              });
            }
          }
        });

        observer.observe(this.forElement, { childList: true });
      }
    }
  }
}
