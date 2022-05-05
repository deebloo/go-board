import { attr, observable, observe } from "@joist/observable";

import { num } from "./attributes";
import { GoGameElement } from "./game.element";
import { game } from "./queries";
import { GoStoneElement, StoneColor } from "./stone.element";

const alpha = Array.from(Array(26)).map((_, i) => i + 65);
const alphabet = alpha.map((x) => String.fromCharCode(x));
const regex = /([A-Z])\[([a-z]{2})\]/;

@observable
export class SGFViewerElement extends HTMLElement {
  @observe @attr path?: string;
  @observe @attr ogsId?: string;
  @observe @attr running = false;
  @observe @num delay = 100;

  @game game!: GoGameElement;

  private data: ParseSGF[] = [];
  private step = 0;

  connectedCallback() {
    if (!this.game) {
      throw new Error("SGFViewerElement requires a child of GoGameElement");
    }

    if (this.path || this.ogsId) {
      this.go();
    }
  }

  async go() {
    this.running = true;

    if (!this.data.length) {
      this.game.board.clear();
    }

    if (this.data.length) {
      return this.play();
    }

    const path = this.ogsId
      ? `https://online-go.com/api/v1/games/${this.ogsId}/sgf`
      : this.path;

    const raw = await fetch(path || "").then((res) => res.text());

    this.data = this.parseSGF(raw);

    this.play();
  }

  async play() {
    if (this.running) {
      const move = this.data[this.step];

      this.step += 1;

      const stone = GoStoneElement.create(move.color, move.space);

      if (this.delay > 0 && this.step > 0) {
        setTimeout(() => {
          this.game.placeStone(stone);

          this.play();
        }, this.delay);
      } else {
        this.game.placeStone(stone);

        this.play();
      }
    }

    if (this.step >= this.data.length) {
      this.step = 0;
      this.data = [];
      this.running = false;
    }
  }

  pause() {
    this.running = false;
  }

  parseSGF(value: string) {
    const moves: ParseSGF[] = [];
    const lines = value.split("\n");
    const { columnLabels, rows } = this.game.board;

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

interface ParseSGF {
  color: StoneColor;
  space: string;
}
