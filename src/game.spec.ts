import { injectable } from "@joist/di";
import { expect, fixture, html } from "@open-wc/testing";

import { GoBoardElement } from "./board.element.js";
import { findGroup } from "./game.js";
import { GoStoneElement } from "./stone.element.js";

customElements.define("go-board", injectable(GoBoardElement));
customElements.define("go-stone", GoStoneElement);

describe("game", () => {
  it("should could 4 liberties for a single stone", async () => {
    const board = await fixture<GoBoardElement>(html`
      <go-board>
        <go-stone space="E16" color="black"></go-stone>
      </go-board>
    `);

    const blackGroup = findGroup(
      board,
      board.querySelector("go-stone[slot='E16']")!
    );

    expect(Array.from(blackGroup.stones).map((s) => s.slot)).to.deep.equal([
      "E16",
    ]);

    expect(Array.from(blackGroup.liberties)).to.deep.equal([
      "E17",
      "E15",
      "D16",
      "F16",
    ]);
  });

  it("should have 8 liberties for column", async () => {
    const board = await fixture<GoBoardElement>(html`
      <go-board>
        <go-stone space="E16" color="black"></go-stone>
        <go-stone space="E15" color="black"></go-stone>
        <go-stone space="E14" color="black"></go-stone>
      </go-board>
    `);

    const blackGroup = findGroup(
      board,
      board.querySelector("go-stone[slot='E16']")!
    );

    expect(Array.from(blackGroup.stones).map((s) => s.slot)).to.deep.equal([
      "E16",
      "E15",
      "E14",
    ]);

    expect(blackGroup.liberties.size).to.equal(8);
  });

  it("should have 8 liberties for row", async () => {
    const board = await fixture<GoBoardElement>(html`
      <go-board>
        <go-stone space="E16" color="black"></go-stone>
        <go-stone space="F16" color="black"></go-stone>
        <go-stone space="G16" color="black"></go-stone>
      </go-board>
    `);

    const blackGroup = findGroup(
      board,
      board.querySelector("go-stone[slot='E16']")!
    );

    expect(Array.from(blackGroup.stones).map((s) => s.slot)).to.deep.equal([
      "E16",
      "F16",
      "G16",
    ]);

    expect(blackGroup.liberties.size).to.equal(8);
  });

  it("should could 11 liberties for row and col", async () => {
    const board = await fixture<GoBoardElement>(html`
      <go-board>
        <go-stone space="C18" color="white"></go-stone>
        <go-stone space="D18" color="white"></go-stone>
        <go-stone space="C17" color="white"></go-stone>

        <go-stone space="E18" color="black"></go-stone>
        <go-stone space="D17" color="black"></go-stone>
        <go-stone space="D16" color="black"></go-stone>
        <go-stone space="E16" color="black"></go-stone>
        <go-stone space="F16" color="black"></go-stone>
        <go-stone space="F15" color="black"></go-stone>
      </go-board>
    `);

    const blackGroup = findGroup(
      board,
      board.querySelector("go-stone[slot='E16']")!
    );

    expect(Array.from(blackGroup.stones).map((s) => s.slot)).to.deep.equal([
      "E16",
      "D16",
      "D17",
      "F16",
      "F15",
    ]);

    expect(Array.from(blackGroup.liberties)).to.deep.equal([
      "E17",
      "E15",
      "D15",
      "C16",
      "F17",
      "F14",
      "G15",
      "G16",
    ]);
  });
});
