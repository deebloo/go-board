import { Injected } from "@joist/di";
import { injectable } from "@joist/di/dom";
import { attr, observable, observe } from "@joist/observable";
import { query, queryAll } from "@joist/query";

import { alphabet, BoardEvent, GoBoardElement } from "./board.element";
import { Debug } from "./go.ctx";
import { GoStoneElement, StoneColor } from "./stone.element";

@observable
@injectable
export class GoGameElement extends HTMLElement {
  static inject = [Debug];

  @observe @attr turn: StoneColor = "black";

  @query("#board,go-board") board!: GoBoardElement;

  @queryAll("go-stone[color='black']", { cache: false })
  black!: NodeListOf<GoStoneElement>;

  @queryAll("go-stone[color='white']", { cache: false })
  white!: NodeListOf<GoStoneElement>;

  constructor(private debug: Injected<Debug>) {
    super();

    this.addEventListener("goboard", (e) => {
      const evt = e as BoardEvent;

      const stone = new GoStoneElement();
      stone.color = this.turn;
      stone.slot = evt.space;

      this.debug().log("Adding Stone", stone);

      this.board.appendChild(stone);

      const orthonginal = this.findAttachedEnemyStones(stone);

      this.debug().log("Enemy stones", orthonginal);

      orthonginal.forEach((stone) => {
        const group = this.findGroup(stone);

        if (!group.liberties.length) {
          group.stones.forEach((stone) => {
            this.board.removeChild(stone);
          });
        }
      });

      this.turn = this.turn === "black" ? "white" : "black";
      this.board.turn = this.turn;
    });

    this.addEventListener("contextmenu", (e) => {
      if (e.target instanceof GoStoneElement && e.target.slot) {
        e.preventDefault();

        this.board.removeChild(e.target);

        this.debug().log("Stone removed: ", e.target);
      }
    });
  }

  connectedCallback() {
    if (!this.board) {
      throw new Error("no board found");
    }

    this.style.display = "inline-block";

    const debug = this.debug();

    debug.log("black:", this.black.length);
    debug.log("white:", this.white.length);

    this.turn = this.black.length > this.white.length ? "white" : "black";
    this.board.turn = this.turn;
  }

  parseCoords(space: string) {
    const array = space.split("");

    return {
      col: array.shift() as string,
      row: array.join(""),
    };
  }

  findAttachedEnemyStones(stone: GoStoneElement): GoStoneElement[] {
    const coords = this.parseCoords(stone.slot);
    const stones: GoStoneElement[] = [];

    const up = this.querySelector<GoStoneElement>(
      `[slot="${coords.col}${Number(coords.row) + 1}"]`
    );

    const down = this.querySelector<GoStoneElement>(
      `[slot="${coords.col}${Number(coords.row) - 1}"]`
    );

    const left = this.querySelector<GoStoneElement>(
      `[slot="${alphabet[alphabet.indexOf(coords.col) - 1]}${coords.row}"]`
    );

    const right = this.querySelector<GoStoneElement>(
      `[slot="${alphabet[alphabet.indexOf(coords.col) + 1]}${coords.row}"]`
    );

    if (up && up.color !== stone.color) {
      stones.push(up);
    }

    if (down && down.color !== stone.color) {
      stones.push(down);
    }

    if (left && left.color !== stone.color) {
      stones.push(left);
    }

    if (right && right.color !== stone.color) {
      stones.push(right);
    }

    return stones;
  }

  findGroup(
    stone: GoStoneElement,
    stones: GoStoneElement[] = [],
    liberties: string[] = []
  ): { stones: GoStoneElement[]; liberties: string[] } {
    const coords = this.parseCoords(stone.slot);

    if (!stones.includes(stone)) {
      stones.push(stone);
    }

    if (!(Number(coords.row) + 1 > this.board.rows)) {
      // up
      this.handleStone(
        `${coords.col}${Number(coords.row) + 1}`,
        stones,
        liberties
      );
    }

    if (!(Number(coords.row) - 1 < 1)) {
      // down
      this.handleStone(
        `${coords.col}${Number(coords.row) - 1}`,
        stones,
        liberties
      );
    }

    if (alphabet.indexOf(coords.col) - 1 > -1) {
      // left
      this.handleStone(
        `${alphabet[alphabet.indexOf(coords.col) - 1]}${coords.row}`,
        stones,
        liberties
      );
    }

    if (alphabet.indexOf(coords.col) + 1 < this.board.cols) {
      // right
      this.handleStone(
        `${alphabet[alphabet.indexOf(coords.col) + 1]}${coords.row}`,
        stones,
        liberties
      );
    }

    return { stones, liberties };
  }

  private handleStone(
    space: string,
    stones: GoStoneElement[],
    liberties: string[]
  ) {
    const debug = this.debug();
    const stone = this.querySelector<GoStoneElement>(`[slot="${space}"]`);

    debug.log("orthogonal space:", space);

    if (!stone) {
      if (!liberties.includes(space)) {
        liberties.push(space);
      }
    } else if (stone.color === stones[0].color && !stones.includes(stone)) {
      stones.push(stone);

      this.findGroup(stone, stones, liberties);
    }

    debug.log("liberties:", liberties);
  }
}
