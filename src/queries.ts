import { queryAll, query } from "@joist/query";

import { StoneColor } from "./stone.element";

export function stones(color: StoneColor) {
  return queryAll(`go-stone[color='${color}']`, { cache: false });
}

export const board = query("#board,go-board");

export const game = query("go-game,#game");
