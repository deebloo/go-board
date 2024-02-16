import "./board.js";
import "./board.js";
import "./stone.js";

import { GoBoardElement } from "./board.js";
import { GoStoneElement } from "./stone.js";

declare global {
  interface HTMLElementTagNameMap {
    "go-board": GoBoardElement;
    "go-stone": GoStoneElement;
  }
}
