import { expect, fixture, html } from "@open-wc/testing";

import { GoBoardElement } from "./board.element";
import { GoGameElement } from "./game.element";

customElements.define("go-game", GoGameElement);
customElements.define("go-board", GoBoardElement);

describe(GoGameElement.name, () => {
  describe("parseUserCoords", () => {
    function createBoard() {
      return fixture<GoGameElement>(html`
        <go-game>
          <go-board id="board"></go-board>
        </go-game>
      `);
    }

    it("should parse user readable space to coords of first", async () => {
      const el = await createBoard();

      expect(el.parseUserCoords("A19")).to.deep.equal({
        row: 0,
        col: 0,
      });
    });

    it("should parse user readable space to coords of last", async () => {
      const el = await createBoard();

      expect(el.parseUserCoords("S1")).to.deep.equal({
        row: 18,
        col: 18,
      });
    });

    it("should parse user readable space to coords of topleft starpoint", async () => {
      const el = await createBoard();

      expect(el.parseUserCoords("D16")).to.deep.equal({
        row: 3,
        col: 3,
      });
    });

    it("should parse user readable space to coords of bottom starpoint", async () => {
      const el = await createBoard();

      expect(el.parseUserCoords("P4")).to.deep.equal({
        row: 15,
        col: 15,
      });
    });
  });
});
