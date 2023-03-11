import { GoBoardElement } from "./board.element.js";
import { SGFViewerElement } from "./sgf-viewer.element.js";
import { GoStoneElement } from "./stone.element.js";

customElements.define("sgf-viewer", SGFViewerElement);
customElements.define("go-board", GoBoardElement);
customElements.define("go-stone", GoStoneElement);
