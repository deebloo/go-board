import { GoBoardElement } from "./board.element.js";
import { debug } from "./debug.js";
import { GoStoneElement, StoneColor } from "./stone.element.js";
import { css, html, shadow, ShadowTemplate } from "./templating.js";

const alpha = Array.from(Array(26)).map((_, i) => i + 65);
const alphabet = alpha.map((x) => String.fromCharCode(x));
const regex = /([A-Z])\[([a-z]{2})\]/;

interface ParseSGF {
  color: StoneColor;
  space: string;
}

const template: ShadowTemplate = {
  css: css`
    :host {
      display: contents;
    }
  `,
  html: html`<slot></slot>`,
};

export class SGFViewerElement extends HTMLElement {
  get path() {
    return this.getAttribute("path") || "";
  }

  set path(id: string) {
    this.setAttribute("path", id);
  }

  get ogsId() {
    return this.getAttribute("ogs-id") || "";
  }

  set ogsId(id: string) {
    this.setAttribute("ogs-id", id);
  }

  get delay() {
    const value = this.getAttribute("delay");

    if (value) {
      return Number(value);
    }

    return 5;
  }

  set delay(value: number) {
    this.setAttribute("delay", value.toString());
  }

  isRunning = false;

  #shadow = shadow(this, template);
  #board: GoBoardElement | null = null;
  #data: ParseSGF[] = [];
  #step = 0;

  constructor() {
    super();

    this.#shadow.addEventListener("slotchange", (e) => {
      const target = e.target as HTMLSlotElement;

      for (let el of target.assignedElements()) {
        if (el instanceof GoBoardElement) {
          this.#board = el;

          if (this.ogsId || this.path) {
            console.log("starting game");

            this.go(() => {
              console.log("game complete");
            });
          }

          break; // stop after first board found
        }
      }
    });
  }

  async go(cb: () => void) {
    if (!this.#board) {
      throw new Error("Could not find board element");
    }

    this.isRunning = true;

    if (!this.#data.length) {
      debug.log("clearning board");
      this.#board.reset();
    }

    if (this.#data.length) {
      return this.play(cb);
    }

    const path = this.ogsId
      ? `https://online-go.com/api/v1/games/${this.ogsId}/sgf`
      : this.path;

    console.log(path);

    if (path) {
      const raw = await fetch(path).then((res) => res.text());

      this.#data = this.parseSGF(raw);

      this.play(cb);
    }
  }

  async play(cb: () => void) {
    if (!this.#board) {
      throw new Error("Could not find board element");
    }

    if (this.isRunning) {
      if (this.#step >= this.#data.length) {
        this.#board.reset();
      }

      const move = this.#data[this.#step];

      this.#step += 1;

      const stone = GoStoneElement.create(move.color, move.space);

      if (this.delay > 0 && this.#step > 0) {
        setTimeout(() => {
          if (!this.#board) {
            throw new Error("Could not find board element");
          }

          this.#board.append(stone);

          this.#board;

          this.play(cb);
        }, this.delay);
      } else {
        this.#board.append(stone);

        this.play(cb);
      }
    }

    if (this.#step >= this.#data.length) {
      this.#step = 0;
      this.#data = [];
      this.isRunning = false;

      cb();
    }
  }

  pause() {
    this.isRunning = false;
  }

  reset() {
    this.isRunning = false;
    this.#step = 0;
    this.#data = [];
  }

  parseSGF(value: string): ParseSGF[] {
    if (!this.#board) {
      throw new Error("Could not find board element");
    }

    const moves: ParseSGF[] = [];
    const lines = value.split("\n");
    const { columnLabels, rows } = this.#board;

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
