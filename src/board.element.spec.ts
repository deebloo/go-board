import { expect, fixture, html } from "@open-wc/testing";

import { GoBoardElement } from "./board.element";
import { Debug, GoConfig } from "./go.ctx";
import { GoStoneElement } from "./stone.element";

customElements.define("go-board", GoBoardElement);
customElements.define("go-stone", GoStoneElement);

describe(GoBoardElement.name, () => {
  it("should create an accurate key of gamestate", async () => {
    const board1 = await fixture<GoBoardElement>(html`
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
    `);

    const board2 = await fixture<GoBoardElement>(html`
      <go-board>
        <go-stone slot="C18" color="white"></go-stone>
        <go-stone slot="D18" color="white"></go-stone>
      </go-board>
    `);

    // should match for the same state
    expect(board1.key()).to.deep.equal(board1.key());

    // should NOT match for different states
    expect(board1.key()).to.not.deep.equal(board2.key());
  });

  it("should throw an error if board size is greater then 19", () => {
    const board = new GoBoardElement(() => new Debug(() => new GoConfig()));
    board.rows = 20;
    board.cols = 19;

    expect(board.connectedCallback.bind(this)).to.throw();
  });
});
