import { attr, observable, observe } from "@joist/observable";
import { query } from "@joist/query";
import { GoBoardElement } from "./board.element";
import { GoGameElement } from "./game.element";
import { GoStoneElement, StoneColor } from "./stone.element";

const alpha = Array.from(Array(26)).map((_, i) => i + 65);
const alphabet = alpha.map((x) => String.fromCharCode(x));
const regex = /([A-Z])\[([a-z]{2})\]/;

@observable
export class SGFViewerElement extends HTMLElement {
  @observe @attr path?: string;
  @observe @attr ogsId?: string;
  @observe @attr isRunning = false;
  @observe @attr<number>({ read: Number }) delay = 100;

  @query("go-board,#board") board!: GoBoardElement;
  @query("go-game,#game") game!: GoGameElement;

  connectedCallback() {
    this.go();
  }

  async go() {
    if (this.isRunning || (!this.ogsId && !this.path)) {
      return;
    }

    const path = this.ogsId
      ? `https://online-go.com/api/v1/games/${this.ogsId}/sgf`
      : this.path;

    const raw = await fetch(path || "").then((res) => res.text());

    this.isRunning = true;

    const data = this.parseSGF(raw);

    let timeout = 0;

    data.forEach((move) => {
      timeout = timeout + this.delay;

      const stone = new GoStoneElement();
      stone.color = move.color;
      stone.slot = move.space;

      if (this.delay > 0) {
        setTimeout(() => {
          this.game.placeStone(stone);
        }, timeout);
      } else {
        this.game.placeStone(stone);
      }
    });

    this.isRunning = false;
  }

  parseSGF(value: string) {
    const moves: Array<{ color: StoneColor; space: string }> = [];
    const lines = value.split("\n");
    const { columnLabels, rows } = this.board;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = regex.exec(line.trim());

      if (match) {
        const coords = match[2].split("");

        const column = columnLabels[alphabet.indexOf(coords[0].toUpperCase())];

        const row = rows - alphabet.indexOf(coords[1].toUpperCase());

        moves.push({
          color: match[1] === "B" ? "black" : "white",
          space: column + row.toString(),
        });
      }
    }

    return moves;
  }
}
