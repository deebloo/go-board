import { GoBoardElement } from "./board.element.js";
import { GoStoneElement } from "./stone.element.js";

export class GroupState {
  stones = new Set<GoStoneElement>();
  liberties = new Set<string>();
}

/**
 * Find all of the stones that are a part of a given stones group
 */
export function findGroup(
  board: GoBoardElement,
  stone: GoStoneElement,
  state: GroupState = new GroupState()
): GroupState {
  state.stones.add(stone);

  const surroundingSpaces = findSurroundingSpaces(board, stone);

  for (let i = 0; i < surroundingSpaces.length; i++) {
    const slot = surroundingSpaces[i];
    const next = board.getSpace(slot);

    if (!next) {
      state.liberties.add(slot);
    } else if (next.color === stone.color && !state.stones.has(next)) {
      // stone is the same color as previous and is not already part of the group
      state.stones.add(next);

      findGroup(board, next, state);
    }
  }

  return state;
}

/**
 * Find all orthogonally connected spaces.
 */
export function findSurroundingSpaces(
  board: GoBoardElement,
  stone: GoStoneElement
) {
  const { columnLabels } = board;
  const coords = parseCoords(stone);
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
export function findAttachedEnemyStones(
  board: GoBoardElement,
  stone: GoStoneElement
): GoStoneElement[] {
  const surroundingSpaces = findSurroundingSpaces(board, stone);
  const stones: GoStoneElement[] = [];

  for (let i = 0; i < surroundingSpaces.length; i++) {
    const next = board.getSpace(surroundingSpaces[i]);

    if (next && next.color !== stone.color) {
      stones.push(next);
    }
  }

  return stones;
}

function parseCoords(stone: GoStoneElement) {
  const array = stone.space.split("");

  return {
    col: array.shift() as string,
    row: array.join(""),
  };
}
