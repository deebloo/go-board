import { Injected } from "@joist/di";
import { injectable } from "@joist/di/dom";
import { attr, observable, observe } from "@joist/observable";
import { query, queryAll } from "@joist/query";

import { alphabet, BoardEvent, GoBoardElement } from "./board.element";
import { Debug } from "./go.ctx";
import { GoStoneElement, StoneColor } from "./stone.element";

@observable
@injectable
export class GoGameElement extends HTMLElement {
  static inject = [Debug];

  @observe @attr turn: StoneColor = "black";

  @query("#board") board!: GoBoardElement;

  @queryAll("go-stone[color='black']", { cache: false })
  black!: NodeListOf<GoStoneElement>;

  @queryAll("go-stone[color='white']", { cache: false })
  white!: NodeListOf<GoStoneElement>;

  constructor(private debug: Injected<Debug>) {
    super();

    this.addEventListener("goboard", (e) => {
      const evt = e as BoardEvent;

      const stone = new GoStoneElement();
      stone.color = this.turn;
      stone.slot = evt.space;

      this.debug().log("Adding Stone", stone);

      this.board.appendChild(stone);

      this.turn = this.turn === "black" ? "white" : "black";
      this.board.turn = this.turn;
    });

    this.addEventListener("contextmenu", (e) => {
      if (e.target instanceof GoStoneElement && e.target.slot) {
        e.preventDefault();

        this.board.removeChild(e.target);

        this.debug().log("Stone removed: ", e.target);
      }
    });
  }

  connectedCallback() {
    if (!this.board) {
      throw new Error("no board found");
    }

    this.style.display = "inline-block";

    const debug = this.debug();

    debug.log("black:", this.black.length);
    debug.log("white:", this.white.length);

    this.turn = this.black.length > this.white.length ? "white" : "black";
    this.board.turn = this.turn;
  }

  parseUserCoords(space: string) {
    const array = space.split("");

    return {
      col: alphabet.indexOf(array.shift() as string),
      row: this.board.rows - Number(array.join("")),
    };
  }
}
