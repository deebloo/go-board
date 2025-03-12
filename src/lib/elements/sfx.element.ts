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

  #ctx = inject(GoBoardContext);

  connectedCallback() {
    const ctx = this.#ctx();

    if (this.src) {
      ctx.sfx = new Sfx(this.src);
    }
  }

  disconnectedCallback() {
    const ctx = this.#ctx();

    ctx.sfx = null;
  }
}
