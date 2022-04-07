import { GoBoardElement } from "./board.element";
import { GoGameElement } from "./game.element";
import { DebugCtxElement } from "./go.ctx";
import { GoStoneElement } from "./stone.element";

customElements.define("go-debug", DebugCtxElement);
customElements.define("go-stone", GoStoneElement);
customElements.define("go-board", GoBoardElement);
customElements.define("go-game", GoGameElement);
