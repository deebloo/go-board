import "../../define.js";

import { expect, fixture, html } from "@open-wc/testing";

import type { GoBoardElement } from "../elements/board.element.js";

import { GoStoneElement } from "../elements/stone.element.js";
import { GoGame } from "./game.js";

describe("game", () => {
  it("should could 4 liberties for a single stone", async () => {
    const service = new GoGame();

    const stone = new GoStoneElement();
    stone.color = "black";
    stone.slot = "E16";

    const board = await fixture<GoBoardElement>(html`
      <go-board>
        ${stone}
      </go-board>
    `);

    const group = service.findGroup(board, stone);

    expect(Array.from(group.stones).map((s) => s.slot)).to.deep.equal(["E16"]);

    expect(Array.from(group.liberties)).to.deep.equal([
      "E17",
      "E15",
      "D16",
      "F16",
    ]);
  });

  it("should have 8 liberties for column", async () => {
    const service = new GoGame();

    const stone = new GoStoneElement();
    stone.color = "black";
    stone.slot = "E16";

    const board = await fixture<GoBoardElement>(html`
      <go-board>
        ${stone}
        <go-stone slot="E15" color="black"></go-stone>
        <go-stone slot="E14" color="black"></go-stone>
      </go-board>
    `);

    const blackGroup = service.findGroup(board, stone);

    expect(Array.from(blackGroup.stones).map((s) => s.slot)).to.deep.equal([
      "E16",
      "E15",
      "E14",
    ]);

    expect(blackGroup.liberties.size).to.equal(8);
  });

  it("should have 8 liberties for row", async () => {
    const service = new GoGame();

    const stone = new GoStoneElement();
    stone.color = "black";
    stone.slot = "E16";

    const board = await fixture<GoBoardElement>(html`
      <go-board>
        ${stone}
        <go-stone slot="F16" color="black"></go-stone>
        <go-stone slot="G16" color="black"></go-stone>
      </go-board>
    `);

    const blackGroup = service.findGroup(board, stone);

    expect(Array.from(blackGroup.stones).map((s) => s.slot)).to.deep.equal([
      "E16",
      "F16",
      "G16",
    ]);

    expect(blackGroup.liberties.size).to.equal(8);
  });

  it("should could 11 liberties for row and col", async () => {
    const service = new GoGame();

    const stone = new GoStoneElement();
    stone.color = "black";
    stone.slot = "E16";

    const board = await fixture<GoBoardElement>(html`
      <go-board>
        <go-stone slot="C18" color="white"></go-stone>
        <go-stone slot="D18" color="white"></go-stone>
        <go-stone slot="C17" color="white"></go-stone>

        <go-stone slot="E18" color="black"></go-stone>
        <go-stone slot="D17" color="black"></go-stone>
        <go-stone slot="D16" color="black"></go-stone>
        ${stone}
        <go-stone slot="F16" color="black"></go-stone>
        <go-stone slot="F15" color="black"></go-stone>
      </go-board>
    `);

    const blackGroup = service.findGroup(board, stone);

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
