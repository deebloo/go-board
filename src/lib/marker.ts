import { css, element, html, shadow, tagName } from "@joist/element";

@element
export class GoStoneMarkerElement extends HTMLElement {
  @tagName static tag = "go-stone-marker";

  @shadow styles = css`
    :host {
      display: flex;
      font-size: clamp(2.5vh, 2.5vw);
      align-items: center;
      justify-content: center;
      height: 50px;
      width: 50px;
    }
  `;

  @shadow dom = html`<slot></slot>`;
}
