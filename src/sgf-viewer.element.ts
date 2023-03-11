import { injectable, Injected, service } from "@joist/di";

import { GoBoardElement } from "./board.element.js";
import { GoStoneElement, StoneColor } from "./stone.element.js";
import { css, html, shadow, ShadowTemplate } from "./templating.js";

const alpha = Array.from(Array(26)).map((_, i) => i + 65);
const alphabet = alpha.map((x) => String.fromCharCode(x));
const regex = /([A-Z])\[([a-z]{2})\]/;

interface ParseSGF {
  color: StoneColor;
  space: string;
}

@service
export class SGFService {
  fetchSGF(path: string) {
    return fetch(path).then((res) => res.text());
  }
}

const template: ShadowTemplate = {
  css: css`
    :host {
      display: contents;
    }
  `,
  html: html`<slot></slot>`,
};

@injectable
export class SGFViewerElement extends HTMLElement {
  static inject = [SGFService];

  path?: string;
  ogsId?: string;
  isRunning = false;
  delay = 100;

  #board = this.querySelector<GoBoardElement>("go-board")!;
  #data: ParseSGF[] = [];
  #step = 0;

  constructor(private sgf: Injected<SGFService>) {
    super();

    shadow(this, template);
  }

  connectedCallback() {
    if (!this.#board) {
      throw new Error("SGFViewerElement requires a child of GoGameElement");
    }

    if (this.path || this.ogsId) {
      this.go();
    }
  }

  async go() {
    const sgf = this.sgf();

    this.isRunning = true;

    if (!this.#data.length) {
      this.#board.clear();
    }

    if (this.#data.length) {
      return this.play();
    }

    const path = this.ogsId
      ? `https://online-go.com/api/v1/games/${this.ogsId}/sgf`
      : this.path;

    if (path) {
      const raw = await sgf.fetchSGF(path);

      this.#data = this.parseSGF(raw);

      this.play();
    }
  }

  async play() {
    if (this.isRunning) {
      if (this.#step >= this.#data.length) {
        this.#board.clear();
      }

      const move = this.#data[this.#step];

      this.#step += 1;

      const stone = GoStoneElement.create(move.color, move.space);

      if (this.delay > 0 && this.#step > 0) {
        setTimeout(() => {
          this.#board.append(stone);

          this.#board;

          this.play();
        }, this.delay);
      } else {
        this.#board.append(stone);

        this.play();
      }
    }

    if (this.#step >= this.#data.length) {
      this.#step = 0;
      this.#data = [];
      this.isRunning = false;
    }
  }

  pause() {
    this.isRunning = false;
  }

  parseSGF(value: string): ParseSGF[] {
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
