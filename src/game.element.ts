import { Injected } from "@joist/di";
import { injectable } from "@joist/di/dom";
import { attr, observable, observe } from "@joist/observable";
import { query, queryAll } from "@joist/query";

import { BoardEvent, GoBoardElement } from "./board.element";
import { Debug } from "./go.ctx";
import { GoStoneElement, StoneColor } from "./stone.element";

interface GroupState {
  stones: Set<GoStoneElement>;
  liberties: Set<string>;
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
    const columnIndex = this.board.columnLabels.indexOf(coords.col);
    const row = Number(coords.row);

    const up = this.querySlot(coords.col, row + 1);
    const down = this.querySlot(coords.col, row - 1);
    const left = this.querySlot(this.board.columnLabels[columnIndex - 1], row);
    const right = this.querySlot(this.board.columnLabels[columnIndex + 1], row);

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
    state: GroupState = { stones: new Set(), liberties: new Set() }
  ): GroupState {
    const coords = this.parseCoords(stone.slot);
    const { columnLabels } = this.board;

    state.stones.add(stone);

    // UP
    const upRow = Number(coords.row) + 1;

    if (!(upRow > this.board.rows)) {
      this.handleStone(stone, `${coords.col}${upRow}`, state);
    }

    // DOWN
    const downRow = Number(coords.row) - 1;

    if (!(downRow < 1)) {
      this.handleStone(stone, `${coords.col}${downRow}`, state);
    }

    // LEFT
    const leftCol = columnLabels.indexOf(coords.col) - 1;

    if (leftCol > -1) {
      this.handleStone(stone, `${columnLabels[leftCol]}${coords.row}`, state);
    }

    // RIGHT
    const rightCol = columnLabels.indexOf(coords.col) + 1;

    if (rightCol < this.board.cols) {
      // right
      this.handleStone(stone, `${columnLabels[rightCol]}${coords.row}`, state);
    }

    return state;
  }

  private handleStone(stone: GoStoneElement, space: string, state: GroupState) {
    const nextStone = this.querySelector<GoStoneElement>(`[slot="${space}"]`);

    if (!nextStone) {
      state.liberties.add(space);
    } else if (
      nextStone.color === stone.color &&
      !state.stones.has(nextStone)
    ) {
      state.stones.add(nextStone);

      this.findGroup(nextStone, state);
    }
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
        debug.log(`Removing ${group.stones.size} stones`);

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

  private querySlot(col: string, row: number) {
    return this.querySelector<GoStoneElement>(`[slot="${col}${row}"]`);
  }
}
