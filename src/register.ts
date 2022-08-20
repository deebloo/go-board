import { GoBoardElement } from "./board.element.js";
import { GoGameElement } from "./game.element.js";
import { DebugCtxElement } from "./go.ctx.js";
import { SGFViewerElement } from "./sgf-viewer.element.js";
import { GoStoneElement } from "./stone.element.js";

customElements.define("go-debug", DebugCtxElement);
customElements.define("go-stone", GoStoneElement);
customElements.define("go-board", GoBoardElement);
customElements.define("go-game", GoGameElement);
customElements.define("sgf-viewer", SGFViewerElement);
