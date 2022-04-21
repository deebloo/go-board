import { Injected } from "@joist/di";
import { injectable } from "@joist/di/dom";
import { attr, observable, observe } from "@joist/observable";
import { query, queryAll } from "@joist/query";

import { BoardEvent, GoBoardElement } from "./board.element";
import { Debug } from "./go.ctx";
import { GoStoneElement, StoneColor } from "./stone.element";

class GroupState {
  stones = new Set<GoStoneElement>();
  liberties = new Set<string>();
}

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

    this.addEventListener("goboard", this.onGoBoardEvent.bind(this));
    this.addEventListener("contextmenu", this.onRightClick.bind(this));
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

    console.log(
      Array.from(this.querySelectorAll("go-stone")).map((stone) => stone.slot)
    );
  }

  /**
   * Find all of the stones that are a part of a given stones group
   */
  findGroup(
    stone: GoStoneElement,
    state: GroupState = new GroupState()
  ): GroupState {
    state.stones.add(stone);

    const surroundingSpaces = this.findSurroundingSpaces(stone);

    for (let i = 0; i < surroundingSpaces.length; i++) {
      const slot = surroundingSpaces[i];
      const next = this.querySpace(slot);

      if (!next) {
        state.liberties.add(slot);
      } else if (next.color === stone.color && !state.stones.has(next)) {
        state.stones.add(next);

        this.findGroup(next, state);
      }
    }

    return state;
  }

  /**
   * Find all orthogonally connected spaces.
   */
  findSurroundingSpaces(stone: GoStoneElement) {
    const coords = this.parseCoords(stone.slot);
    const row = Number(coords.row);
    const col = this.board.columnLabels.indexOf(coords.col);
    const { columnLabels } = this.board;

    return [
      { row: row + 1, col },
      { row: row - 1, col },
      { row, col: col - 1 },
      { row, col: col + 1 },
    ]
      .filter(({ row, col }) => {
        const rowIsValid = row <= this.board.rows && row >= 0;
        const colIsValid = col > -1 && col < this.board.cols;

        return rowIsValid && colIsValid;
      })
      .map(({ row, col }) => `${columnLabels[col]}${row}`);
  }

  /**
   * Find all enemy stones that are orthogonally connected to a given stone
   */
  findAttachedEnemyStones(stone: GoStoneElement): GoStoneElement[] {
    const surroundingSpaces = this.findSurroundingSpaces(stone);
    const stones: GoStoneElement[] = [];

    for (let i = 0; i < surroundingSpaces.length; i++) {
      const next = this.querySpace(surroundingSpaces[i]);

      if (next && next.color !== stone.color) {
        stones.push(next);
      }
    }

    return stones;
  }

  private onGoBoardEvent(e: Event) {
    const evt = e as BoardEvent;
    const debug = this.debug();

    const stone = new GoStoneElement();
    stone.color = this.turn;
    stone.slot = evt.space;

    debug.group("Adding stone:", stone);

    this.board.appendChild(stone);

    // find all attached enemies
    const enemies = this.findAttachedEnemyStones(stone);

    debug.log("Finding enemy stones:", enemies);

    // for each enemy stone check its group and liberties.
    enemies.forEach((stone) => {
      const group = this.findGroup(stone);

      // if a group has no liberties remove all of its stones
      if (!group.liberties.size) {
        debug.log("Removing Stones:\n", ...group.stones);

        group.stones.forEach((stone) => {
          this.board.removeChild(stone);
        });
      }
    });

    // find added stones group
    const group = this.findGroup(stone);

    debug.log("Stone part of following group:", group);

    // if the current group has no liberties remove it. not allowed
    if (!group.liberties.size) {
      this.board.removeChild(stone);
    } else {
      this.turn = this.turn === "black" ? "white" : "black";
      this.board.turn = this.turn;
    }

    debug.groupEnd();
  }

  private onRightClick(e: Event) {
    if (
      e.target instanceof GoStoneElement &&
      e.target.slot &&
      !this.board.static
    ) {
      e.preventDefault();

      this.board.removeChild(e.target);

      this.debug().log("Stone removed: ", e.target);
    }
  }

  private parseCoords(space: string) {
    const array = space.split("");

    return {
      col: array.shift() as string,
      row: array.join(""),
    };
  }

  private querySpace(space: string): GoStoneElement | null {
    return this.querySelector<GoStoneElement>(`[slot="${space}"]`);
  }
}
