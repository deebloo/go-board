import { injectable } from "@joist/di";

import { GoBoardElement } from "./board.element.js";
import { DebugCtxElement } from "./go.ctx.js";
import { SGFViewerElement } from "./sgf-viewer.element.js";
import { GoStoneElement } from "./stone.element.js";

customElements.define("sgf-viewer", injectable(SGFViewerElement));
customElements.define("go-debug", injectable(DebugCtxElement));
customElements.define("go-board", injectable(GoBoardElement));
customElements.define("go-stone", GoStoneElement);
