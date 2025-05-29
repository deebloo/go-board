import { StaticToken } from "@joist/di";
import type { GoStoneElement, StoneColor } from "../elements/stone.element.js";

import type { Sfx } from "./sfx.js";

export const GoBoardContext = new StaticToken<GoBoard>("GoBoardContext");

export interface GoBoard extends HTMLElement {
  turn: StoneColor;
  rows: number;
  cols: number;
  readonly: boolean;
  novalidate: boolean;
  spaces: Map<string, GoStoneElement | null>;
  previousKey: string | null;
  currentKey: string | null;
  sfx: Sfx | null;

  registerStone(stone: GoStoneElement): void;
  unregisterStone(stone: GoStoneElement): void;
}
