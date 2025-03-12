import { inject, injectable } from "@joist/di";

import type { GoBoardElement } from "../elements/board.element.js";
import type { GoStoneElement } from "../elements/stone.element.js";
import { Debug } from "./debug.service.js";
import { PromptService } from "./prompt.service.js";

export class GroupState {
  stones = new Set<GoStoneElement>();
  liberties = new Set<string>();
}

@injectable()
export class GoGame {
  #debug = inject(Debug);
  #prompt = inject(PromptService);

  findGroup(
    board: GoBoardElement,
    stone: GoStoneElement,
    state: GroupState = new GroupState(),
  ): GroupState {
    state.stones.add(stone);

    const surroundingSpaces = this.findSurroundingSpaces(board, stone);

    for (let i = 0; i < surroundingSpaces.length; i++) {
      const slot = surroundingSpaces[i];
      const next = board.spaces.get(slot);

      if (!next) {
        state.liberties.add(slot);
      } else if (next.color === stone.color && !state.stones.has(next)) {
        // stone is the same color as previous and is not already part of the group
        state.stones.add(next);

        this.findGroup(board, next, state);
      }
    }

    return state;
  }

  findSurroundingSpaces(board: GoBoardElement, stone: GoStoneElement) {
    const { columnLabels } = board;
    const coords = parseCoords(stone);
    const row = Number(coords.row);
    const col = columnLabels.indexOf(coords.col);

    const spaces = [
      { row: row + 1, col },
      { row: row - 1, col },
      { row, col: col - 1 },
      { row, col: col + 1 },
    ];

    const res = [];

    for (let i = 0; i < spaces.length; i++) {
      const { row, col } = spaces[i];

      if (row <= board.rows && row > 0 && col > -1 && col < board.cols) {
        res.push(`${columnLabels[col]}${row}`);
      }
    }

    return res;
  }

  findAttachedEnemyStones(
    board: GoBoardElement,
    stone: GoStoneElement,
  ): GoStoneElement[] {
    const surroundingSpaces = this.findSurroundingSpaces(board, stone);
    const stones: GoStoneElement[] = [];

    for (let i = 0; i < surroundingSpaces.length; i++) {
      const next = board.spaces.get(surroundingSpaces[i]);

      if (next && next.color !== stone.color) {
        stones.push(next);
      }
    }

    return stones;
  }

  validateStonePlacement(
    board: GoBoardElement,
    stone: GoStoneElement,
    success: () => void,
  ) {
    const debug = this.#debug();
    const prompt = this.#prompt();

    debug.group("Checking stone:", stone);

    // find all attached enemies
    const enemies = this.findAttachedEnemyStones(board, stone);

    debug.log("Finding enemy stones:", enemies);

    // keep track of removed stones
    const removedStones: GoStoneElement[] = [];

    // for each enemy stone check its group and liberties.
    for (const enemy of enemies) {
      const group = this.findGroup(board, enemy);

      // if a group has no liberties remove all of its stones
      if (!group.liberties.size) {
        debug.log("Removing Stones:\n", ...group.stones);

        for (const stone of group.stones) {
          board.spaces.set(stone.slot, null); // clear out stone
          removedStones.push(stone); // keep track of removed stones
        }
      }
    }

    const key = board.createKey();

    if (board.currentKey === key || board.previousKey === key) {
      // If the current board state has already existed the move is not allowed

      // reset the board state by adding removed stones back
      for (const stone of removedStones) {
        board.spaces.set(stone.slot, stone);
      }

      // remove the previously placed stone
      stone.remove();

      // notify the user
      prompt.alert(`Move is not allowed: ${stone.slot} ${stone.color}`);
    } else {
      // board state is valid and we can proceed

      if (removedStones.length) {
        // remove captured stones from dom
        for (const stone of removedStones) {
          stone.remove();
        }

        if (board.sfx) {
          board.sfx.captureStones(removedStones.length);
        }
      }

      // find added stones group
      const group = this.findGroup(board, stone);

      debug.log("Stone part of following group:", group);

      // if the current group has no liberties remove it. not allowed
      if (!group.liberties.size) {
        stone.remove();

        prompt.alert("Move is suicidal!");
      } else {
        board.turn = stone.color === "black" ? "white" : "black";

        // track current and previous board key
        board.previousKey = board.currentKey;
        board.currentKey = key;

        success();
      }
    }

    debug.groupEnd();
  }
}

function parseCoords(stone: GoStoneElement) {
  const array = stone.slot.split("");

  return {
    col: array.shift() as string,
    row: array.join(""),
  };
}
