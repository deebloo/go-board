import { expect, fixture, html } from "@open-wc/testing";

import { GoBoardElement } from "./board.element.js";
import { GoStoneElement } from "./stone.element.js";

customElements.define("go-board", GoBoardElement);
customElements.define("go-stone", GoStoneElement);

describe(GoBoardElement.name, () => {
  it("should create an accurate key of gamestate", async () => {
    const board1 = await fixture<GoBoardElement>(html`
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

    const board2 = await fixture<GoBoardElement>(html`
      <go-board>
        <go-stone space="C18" color="white"></go-stone>
        <go-stone space="D18" color="white"></go-stone>
      </go-board>
    `);

    // should match for the same state
    expect(board1.key()).to.equal(board1.key());

    // should NOT match for different states
    expect(board1.key()).to.not.equal(board2.key());
  });

  it("should create the same board state even with moves in a different order", async () => {
    const board1 = await fixture<GoBoardElement>(html`
      <go-board>
        <go-stone space="C18" color="white"></go-stone>
        <go-stone space="D18" color="white"></go-stone>
      </go-board>
    `);

    const board2 = await fixture<GoBoardElement>(html`
      <go-board>
        <go-stone space="D18" color="white"></go-stone>
        <go-stone space="C18" color="white"></go-stone>
      </go-board>
    `);

    // should NOT match for different states
    expect(board1.key()).to.equal(board2.key());
  });

  it("should throw an error if board size is greater then 19", () => {
    const board = new GoBoardElement();

    board.rows = 20;
    board.cols = 19;

    expect(board.connectedCallback.bind(this)).to.throw();
  });
});
