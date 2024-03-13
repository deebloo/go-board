import { css, element, html, shadow, tagName } from "@joist/element";

@element
export class GoStoneMarkerElement extends HTMLElement {
  @tagName static tag = "go-stone-marker";

  @shadow styles = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 50px;
      width: 50px;
    }
  `;

  @shadow dom = html`<slot></slot>`;
}
