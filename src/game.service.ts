import { service } from "@joist/di";

import { GoBoardElement } from "./board.element.js";
import { GoStoneElement } from "./stone.element.js";

export class GroupState {
  stones = new Set<GoStoneElement>();
  liberties = new Set<string>();
}

@service
export class GoGameService {
  alert(message: string) {
    window.alert(message);
  }

  /**
   * Find all of the stones that are a part of a given stones group
   */
  findGroup(board: GoBoardElement, stone: GoStoneElement, state: GroupState = new GroupState()): GroupState {
    state.stones.add(stone);

    const surroundingSpaces = this.findSurroundingSpaces(board, stone);

    for (let i = 0; i < surroundingSpaces.length; i++) {
      const slot = surroundingSpaces[i];
      const next = board.querySelector<GoStoneElement>(`[slot="${surroundingSpaces[i]}"]`);

      if (!next) {
        state.liberties.add(slot);
      } else if (next.color === stone.color && !state.stones.has(next)) {
        state.stones.add(next);

        this.findGroup(board, next, state);
      }
    }

    return state;
  }

  /**
   * Find all orthogonally connected spaces.
   */
  findSurroundingSpaces(board: GoBoardElement, stone: GoStoneElement) {
    const { columnLabels } = board;
    const coords = this.parseCoords(stone);
    const row = Number(coords.row);
    const col = columnLabels.indexOf(coords.col);

    return [
      { row: row + 1, col },
      { row: row - 1, col },
      { row, col: col - 1 },
      { row, col: col + 1 },
    ]
      .filter(({ row, col }) => {
        const rowIsValid = row <= board.rows && row > 0;
        const colIsValid = col > -1 && col < board.cols;

        return rowIsValid && colIsValid;
      })
      .map(({ row, col }) => `${columnLabels[col]}${row}`);
  }

  /**
   * Find all enemy stones that are orthogonally connected to a given stone
   */
  findAttachedEnemyStones(board: GoBoardElement, stone: GoStoneElement): GoStoneElement[] {
    const surroundingSpaces = this.findSurroundingSpaces(board, stone);
    const stones: GoStoneElement[] = [];

    for (let i = 0; i < surroundingSpaces.length; i++) {
      const next = board.querySelector<GoStoneElement>(`[slot="${surroundingSpaces[i]}"]`);

      if (next && next.color !== stone.color) {
        stones.push(next);
      }
    }

    return stones;
  }

  private parseCoords(stone: GoStoneElement) {
    const array = stone.space.split("");

    return {
      col: array.shift() as string,
      row: array.join(""),
    };
  }
}
