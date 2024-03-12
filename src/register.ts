import "./lib/board.js";
import "./lib/board.js";
import "./lib/stone.js";

import { GoBoardElement } from "./lib/board.js";
import { GoStoneElement } from "./lib/stone.js";

declare global {
  interface HTMLElementTagNameMap {
    "go-board": GoBoardElement;
    "go-stone": GoStoneElement;
  }

  namespace JSX {
    interface IntrinsicElements {
      ["go-board"]: any;
      ["go-stone"]: any;
    }
  }
}
