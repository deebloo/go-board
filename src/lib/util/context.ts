import { StaticToken } from "@joist/di";
import type { GoStoneElement, StoneColor } from "../elements/stone.element.js";

import type { Move } from "./sgf.js";

export const GoBoardContext = new StaticToken<GoBoard>("GoBoardContext");

export interface GoBoard extends HTMLElement {
  turn: StoneColor;
  rows: number;
  cols: number;
  readonly: boolean;
  novalidate: boolean;
  moves: Move[];
  columnLabels: string[];
  spaces: Map<string, GoStoneElement | null>;
  previousKey: string;
  currentKey: string;

  registerStone(stone: GoStoneElement): void;
  unregisterStone(stone: GoStoneElement): void;
}
