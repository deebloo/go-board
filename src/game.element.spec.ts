import { expect, fixture, html } from "@open-wc/testing";

import { GoBoardElement } from "./board.element";
import { GoGameElement } from "./game.element";
import { GoStoneElement } from "./stone.element";

customElements.define("go-game", GoGameElement);
customElements.define("go-board", GoBoardElement);
customElements.define("go-stone", GoStoneElement);

describe(GoGameElement.name, () => {
  it("should could 4 liberties for a single stone", async () => {
    const el = await fixture<GoGameElement>(html`
      <go-game>
        <go-board>
          <go-stone slot="E16" color="black"></go-stone>
        </go-board>
      </go-game>
    `);

    const blackGroup = el.findGroup(el.querySelector("[slot='E16']")!);
    // const whiteGroup = el.findGroup(el.querySelector("[slot='C18']")!);

    expect(Array.from(blackGroup.stones).map((s) => s.slot)).to.deep.equal([
      "E16",
    ]);

    expect(blackGroup.liberties.length).to.equal(4);
  });

  it("should have 8 liberties for column", async () => {
    const el = await fixture<GoGameElement>(html`
      <go-game>
        <go-board>
          <go-stone slot="E16" color="black"></go-stone>
          <go-stone slot="E15" color="black"></go-stone>
          <go-stone slot="E14" color="black"></go-stone>
        </go-board>
      </go-game>
    `);

    const blackGroup = el.findGroup(el.querySelector("[slot='E16']")!);
    // const whiteGroup = el.findGroup(el.querySelector("[slot='C18']")!);

    expect(Array.from(blackGroup.stones).map((s) => s.slot)).to.deep.equal([
      "E16",
      "E15",
      "E14",
    ]);

    expect(blackGroup.liberties.length).to.equal(8);
  });

  it("should have 8 liberties for row", async () => {
    const el = await fixture<GoGameElement>(html`
      <go-game>
        <go-board>
          <go-stone slot="E16" color="black"></go-stone>
          <go-stone slot="F16" color="black"></go-stone>
          <go-stone slot="G16" color="black"></go-stone>
        </go-board>
      </go-game>
    `);

    const blackGroup = el.findGroup(el.querySelector("[slot='E16']")!);
    // const whiteGroup = el.findGroup(el.querySelector("[slot='C18']")!);

    expect(Array.from(blackGroup.stones).map((s) => s.slot)).to.deep.equal([
      "E16",
      "F16",
      "G16",
    ]);

    expect(blackGroup.liberties.length).to.equal(8);
  });

  it("should could 11 liberties for row and col", async () => {
    const el = await fixture<GoGameElement>(html`
      <go-game>
        <go-board>
          <go-stone slot="E16" color="black"></go-stone>
          <go-stone slot="F16" color="black"></go-stone>
          <go-stone slot="G16" color="black"></go-stone>
          <go-stone slot="E17" color="black"></go-stone>
          <go-stone slot="E18" color="black"></go-stone>
        </go-board>
      </go-game>
    `);

    const blackGroup = el.findGroup(el.querySelector("[slot='E16']")!);
    // const whiteGroup = el.findGroup(el.querySelector("[slot='C18']")!);

    expect(Array.from(blackGroup.stones).map((s) => s.slot)).to.deep.equal([
      "E16",
      "E17",
      "E18",
      "F16",
      "G16",
    ]);

    expect(blackGroup.liberties.length).to.equal(11);
  });
});
