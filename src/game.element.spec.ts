import { expect, fixture, html } from "@open-wc/testing";

import { GoBoardElement } from "./board.element";
import { GoGameElement } from "./game.element";
import { GoStoneElement } from "./stone.element";

customElements.define("go-game", GoGameElement);
customElements.define("go-board", GoBoardElement);
customElements.define("go-stone", GoStoneElement);

describe(GoGameElement.name, () => {
  it("should workd", async () => {
    const el = await fixture<GoGameElement>(html`
      <go-game>
        <go-board>
          <go-stone slot="D16"></go-stone>
        </go-board>
      </go-game>
    `);

    console.log(el.findGroup(el.querySelector("slot[D16]")!));
  });
});
