import "./board.element.js";
import "./board.element.js";
import "./stone.element.js";

import { GoBoardElement } from "./board.element.js";
import { GoStoneElement } from "./stone.element.js";

declare global {
  interface HTMLElementTagNameMap {
    "go-board": GoBoardElement;
    "go-stone": GoStoneElement;
  }
}
