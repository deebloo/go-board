import { inject, injectable } from "@joist/di";
import { attr, element } from "@joist/element";

import { GoBoardContext } from "../util/context.js";
import { Sfx } from "../util/sfx.js";

@injectable({
  name: "go-sfx-ctx",
})
@element({
  tagName: "go-sfx",
})
export class GoBoardSfx extends HTMLElement {
  @attr()
  accessor src = "";

  #sfx: Sfx | null = null;
  #controller = new AbortController();
  #ctx = inject(GoBoardContext);

  attributeChangedCallback() {
    if (this.src) {
      this.#sfx = new Sfx(this.src);
    }
  }

  connectedCallback() {
    const ctx = this.#ctx();

    ctx.addEventListener(
      "stone-placed",
      () => {
        this.#sfx?.placeStone();
      },
      { signal: this.#controller.signal },
    );

    ctx.addEventListener(
      "stones-captured",
      (e) => {
        this.#sfx?.captureStones(e.count);
      },
      { signal: this.#controller.signal },
    );
  }

  disconnectedCallback() {
    this.#controller?.abort();
  }
}
