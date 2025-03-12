import { inject, injectable } from "@joist/di";
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

  attributeChangedCallback() {
    if (this.src && this.isConnected) {
      fetch(this.src)
        .then((res) => res.text())
        .then((res) => {
          const ctx = this.#ctx();

          const moves = parseSGF(res, ctx.columnLabels, ctx.rows);

          for (const move of moves) {
            const stone = new GoStoneElement();
            stone.color = move.color;
            stone.slot = move.space;

            ctx.turn = move.color;

            ctx.append(stone);
          }
        });
    }
  }
}
