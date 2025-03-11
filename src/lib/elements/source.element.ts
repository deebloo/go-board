import { inject, injectable, injected } from "@joist/di";
import { attr, element } from "@joist/element";

import { GoBoardContext } from "../util/context.js";
import { parseSGF } from "../util/sgf.js";
import { GoStoneElement } from "./stone.element.js";

@injectable({
  name: "go-source-ctx",
})
@element({
  tagName: "go-source",
})
export class GoBoardSourceElement extends HTMLElement {
  @attr()
  accessor src = "";

  #ctx = inject(GoBoardContext);

  @injected()
  onInjected() {
    this.import();
  }

  async import() {
    const ctx = this.#ctx();

    if (this.src) {
      const raw = await fetch(this.src).then((res) => res.text());

      if (raw) {
        const moves = parseSGF(raw, ctx.columnLabels, ctx.rows);
        const ogValidateValue = ctx.novalidate;

        ctx.novalidate = true;

        for (const move of moves) {
          const stone = new GoStoneElement();
          stone.color = move.color;
          stone.slot = move.space;

          ctx.turn = move.color;

          ctx.append(stone);
          ctx.registerStone(stone);
        }

        ctx.novalidate = ogValidateValue;
      }
    }
  }
}
