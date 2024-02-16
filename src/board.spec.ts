import "./register.js";

import { expect, fixture, html } from "@open-wc/testing";

import { GoBoardElement } from "./board.js";
import { GoStoneElement } from "./stone.js";

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
    expect(board1.key()).to.equal(board1.key());

    // should NOT match for different states
    expect(board1.key()).to.not.equal(board2.key());
  });

  it("should create the same board state even with moves in a different order", async () => {
    const board1 = await fixture<GoBoardElement>(html`
      <go-board>
        <go-stone slot="C18" color="black"></go-stone>
        <go-stone slot="D18" color="white"></go-stone>
      </go-board>
    `);

    const board2 = await fixture<GoBoardElement>(html`
      <go-board>
        <go-stone slot="D18" color="white"></go-stone>
        <go-stone slot="C18" color="black"></go-stone>
      </go-board>
    `);

    expect(board1.key()).to.equal(board2.key());
  });

  it("should add stones to internal map when stone elements are added", async () => {
    const board = await fixture<GoBoardElement>(html`
      <go-board>
        <go-stone slot="C18" color="black"></go-stone>
        <go-stone slot="D18" color="white"></go-stone>
      </go-board>
    `);

    expect(board.getSpace("C18")).to.be.instanceOf(GoStoneElement);
    expect(board.getSpace("D18")).to.be.instanceOf(GoStoneElement);
  });

  it("should remove stones from internal map when stone elements are removed", async () => {
    const stone = document.createElement("go-stone") as GoStoneElement;
    stone.color = "black";
    stone.slot = "C18";

    const board = await fixture<GoBoardElement>(html`
      <go-board>${stone}</go-board>
    `);

    expect(board.getSpace("C18")).to.be.instanceOf(GoStoneElement);

    stone.remove();

    expect(board.getSpace("C18")).to.be.null;
  });

  it("should submit the default key value to a form", async () => {
    const board = await fixture<HTMLFormElement>(html`
      <form>
        <go-board name="game"></go-board>

        <button>submit</button>
      </form>
    `);

    return new Promise((resolve) => {
      board.addEventListener("submit", (e) => {
        e.preventDefault();

        const form = new FormData(board);

        expect(form.get("game")).to.equal(
          "*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************"
        );

        resolve();
      });

      board.querySelector("button")?.click();
    });
  });

  it("should submit updated key when stones are added", async () => {
    const board = await fixture<HTMLFormElement>(html`
      <form>
        <go-board name="game">
          <go-stone slot="A1" color="black"></go-stone>
        </go-board>

        <button>submit</button>
      </form>
    `);

    return new Promise((resolve) => {
      board.addEventListener("submit", (e) => {
        e.preventDefault();

        const form = new FormData(board);

        expect(form.get("game")).to.equal(
          "******************************************************************************************************************************************************************************************************************************************************************************************************************************************************BA1******************"
        );

        resolve();
      });

      board.querySelector("button")?.click();
    });
  });
});
