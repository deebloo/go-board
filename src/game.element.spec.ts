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
          <go-stone slot="C17" color="black"></go-stone>
          <go-stone slot="D16" color="black"></go-stone>
          <go-stone slot="E16" color="black"></go-stone>
          <go-stone slot="F16" color="black"></go-stone>
          <go-stone slot="F15" color="black"></go-stone>
          <go-stone slot="F14" color="black"></go-stone>
        </go-board>
      </go-game>
    `);

    const group = el.findGroup(el.querySelector("[slot='D16']")!);

    expect(Array.from(group).map((s) => s.slot)).to.deep.equal([
      "D16",
      "E16",
      "F16",
      "F15",
      "F14",
    ]);
  });

  it("should count liberties", () => {});
});
