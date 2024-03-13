import "./lib/board.js";
import "./lib/board.js";
import "./lib/stone.js";
import "./lib/marker.js";

import { GoBoardElement } from "./lib/board.js";
import { GoStoneElement } from "./lib/stone.js";
import { GoStoneMarkerElement } from "./lib/marker.js";

declare global {
  interface HTMLElementTagNameMap {
    "go-board": GoBoardElement;
    "go-stone": GoStoneElement;
    "go-marker": GoStoneMarkerElement;
  }

  namespace JSX {
    interface IntrinsicElements {
      ["go-board"]: any;
      ["go-stone"]: any;
      ["go-marker"]: any;
    }
  }
}
