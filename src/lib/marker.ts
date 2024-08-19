import { css, element, html } from "@joist/element";

@element({
  tagName: "go-marker",
  shadow: [
    css`
      :host {
        display: flex;
        font-size: clamp(2.5vh, 2.5vw);
        align-items: center;
        justify-content: center;
        height: 50px;
        width: 50px;
      }
    `,
    html`<slot></slot>`,
  ],
})
export class GoMarkerElement extends HTMLElement {}
