import "./lib/elements/board.element.js";
import "./lib/elements/source.element.js";
import "./lib/elements/sfx.element.js";
import "./lib/elements/stone.element.js";
import "./lib/elements/marker.element.js";

import type { GoBoardElement } from "./lib/elements/board.element.js";
import type { GoMarkerElement } from "./lib/elements/marker.element.js";
import type { GoBoardSfx } from "./lib/elements/sfx.element.js";
import type { GoBoardSourceElement } from "./lib/elements/source.element.js";
import type { GoStoneElement } from "./lib/elements/stone.element.js";

declare global {
  interface HTMLElementTagNameMap {
    "go-board": GoBoardElement;
    "go-board-source": GoBoardSourceElement;
    "go-board-sfx": GoBoardSfx;
    "go-stone": GoStoneElement;
    "go-marker": GoMarkerElement;
  }

  namespace JSX {
    interface IntrinsicElements {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      "go-board": any;
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      "go-board-source": any;
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      "go-board-sfx": any;
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      "go-stone": any;
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      "go-marker": any;
    }
  }
}
