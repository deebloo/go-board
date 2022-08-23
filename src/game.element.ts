import { Injected, injectable } from "@joist/di";
import { observable } from "@joist/observable";
import { css, styled } from "@joist/styled";

import { BoardEvent, GoBoardElement } from "./board.element.js";
import { GoGameService } from "./game.service.js";
import { Debug } from "./go.ctx.js";
import { board, stones } from "./queries.js";
import { GoStoneElement } from "./stone.element.js";

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

  #pastStates = new Set<string>();

  constructor(
    private debug: Injected<Debug>,
    private game: Injected<GoGameService>
  ) {
    super();

    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = /*html*/ `<slot></slot>`;

    this.addEventListener("goboard", this.onGoBoardEvent.bind(this));
  }

  connectedCallback() {
    if (!this.board) {
      throw new Error("no board found");
    }

    const debug = this.debug();

    debug.log("black:", this.black.length);
    debug.log("white:", this.white.length);

    const nodes = Array.from(this.board.children);

    this.board.clear();

    nodes.forEach((node) => {
      if (node instanceof GoStoneElement) {
        this.placeStone(node);
      } else {
        this.board.append(node);
      }
    });
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

    // keep track of removed stones
    const removedStones: GoStoneElement[] = [];

    // for each enemy stone check its group and liberties.
    enemies.forEach((stone) => {
      const group = game.findGroup(this.board, stone);

      // if a group has no liberties remove all of its stones
      if (!group.liberties.size) {
        debug.log("Removing Stones:\n", ...group.stones);

        group.stones.forEach((stone) => {
          stone.removeAttribute("slot"); // stones are removed by removing it's assinged slot

          removedStones.push(stone);
        });
      }
    });

    const key = this.board.key();

    if (this.#pastStates.has(key)) {
      // If the current board state has already existed the move is not allowed

      debug.group("Move not allowed!");
      debug.log(key.toString());
      debug.log(this.#pastStates);
      debug.groupEnd();

      // Add the removed stones back
      removedStones.forEach((stone) => {
        stone.slot = stone.space!;
      });

      stone.remove();

      game.alert("Move not allowed!");
    } else {
      // keep track of previous board states
      this.#pastStates.add(key);

      // find added stones group
      const group = game.findGroup(this.board, stone);

      debug.log("Stone part of following group:", group);

      // if the current group has no liberties remove it. not allowed
      if (!group.liberties.size) {
        stone.remove();

        game.alert("Move is suicidal!");
      } else {
        this.board.turn = this.board.turn === "black" ? "white" : "black";
      }
    }

    debug.groupEnd();
  }

  private onGoBoardEvent(e: Event) {
    const evt = e as BoardEvent;

    const stone = GoStoneElement.create(this.board.turn, evt.space);

    this.placeStone(stone);
  }
}
