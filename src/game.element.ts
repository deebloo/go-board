import { Injected, injectable } from "@joist/di";
import { observable } from "@joist/observable";
import { css, styled } from "@joist/styled";

import { BoardEvent, GoBoardElement } from "./board.element";
import { GoGameService } from "./game.service";
import { Debug } from "./go.ctx";
import { board, stones } from "./queries";
import { GoStoneElement } from "./stone.element";

@observable
@styled
@injectable
export class GoGameElement extends HTMLElement {
  static inject = [Debug, GoGameService];

  static styles = [
    css`
      :host {
        display: contents;
      }
    `,
  ];

  @board board!: GoBoardElement;

  @stones("black") black!: NodeListOf<GoStoneElement>;
  @stones("white") white!: NodeListOf<GoStoneElement>;

  constructor(
    private debug: Injected<Debug>,
    private game: Injected<GoGameService>
  ) {
    super();

    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = "<slot></slot>";

    this.addEventListener("goboard", this.onGoBoardEvent.bind(this));
    this.addEventListener("contextmenu", this.onRightClick.bind(this));
  }

  connectedCallback() {
    if (!this.board) {
      throw new Error("no board found");
    }

    const debug = this.debug();

    debug.log("black:", this.black.length);
    debug.log("white:", this.white.length);

    this.board.turn = this.black.length > this.white.length ? "white" : "black";
  }

  queryRoot() {
    return this;
  }

  placeStone(stone: GoStoneElement) {
    const debug = this.debug();
    const game = this.game();

    debug.group("Adding stone:", stone);

    this.board.appendChild(stone);

    // find all attached enemies
    const enemies = game.findAttachedEnemyStones(this.board, stone);

    debug.log("Finding enemy stones:", enemies);

    // for each enemy stone check its group and liberties.
    enemies.forEach((stone) => {
      const group = game.findGroup(this.board, stone);

      // if a group has no liberties remove all of its stones
      if (!group.liberties.size) {
        debug.log("Removing Stones:\n", ...group.stones);

        group.stones.forEach((stone) => {
          stone.removeAttribute("slot");
        });
      }
    });

    // find added stones group
    const group = game.findGroup(this.board, stone);

    debug.log("Stone part of following group:", group);

    // if the current group has no liberties remove it. not allowed
    if (!group.liberties.size) {
      this.board.removeChild(stone);
    } else {
      this.board.turn = this.board.turn === "black" ? "white" : "black";
    }

    debug.groupEnd();
  }

  private onGoBoardEvent(e: Event) {
    const evt = e as BoardEvent;

    const stone = GoStoneElement.create(this.board.turn, evt.space);

    this.placeStone(stone);
  }

  private onRightClick(e: Event) {
    if (
      e.target instanceof GoStoneElement &&
      e.target.slot &&
      !this.board.static
    ) {
      e.preventDefault();

      this.board.removeChild(e.target);

      this.debug().log("Stone removed: ", e.target);
    }
  }
}
