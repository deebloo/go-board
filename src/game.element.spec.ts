import { expect, fixture, html } from "@open-wc/testing";

import { GoBoardElement } from "./board.element";
import { GoGameElement } from "./game.element";
import { GoStoneElement } from "./stone.element";

customElements.define("go-game", GoGameElement);
customElements.define("go-board", GoBoardElement);
customElements.define("go-stone", GoStoneElement);

describe(GoGameElement.name, () => {
  it("should work", async () => {
    const el = await fixture<GoGameElement>(html`
      <go-game>
        <go-board>
          <go-stone slot="C18" color="white"></go-stone>
          <go-stone slot="D18" color="white"></go-stone>
          <go-stone slot="C17" color="white"></go-stone>

          <go-stone slot="E18" color="black"></go-stone>
          <go-stone slot="D17" color="black"></go-stone>
          <go-stone slot="D16" color="black"></go-stone>
          <go-stone slot="E16" color="black"></go-stone>
          <go-stone slot="F16" color="black"></go-stone>
          <go-stone slot="F15" color="black"></go-stone>
        </go-board>
      </go-game>
    `);

    const blackGroup = el.findGroup(el.querySelector("[slot='E16']")!);
    const whiteGroup = el.findGroup(el.querySelector("[slot='C18']")!);

    expect(Array.from(blackGroup).map((s) => s.slot)).to.deep.equal([
      "E16",
      "D16",
      "D17",
      "F16",
      "F15",
    ]);

    expect(Array.from(whiteGroup).map((s) => s.slot)).to.deep.equal([
      "C18",
      "C17",
      "D18",
    ]);
  });
});
