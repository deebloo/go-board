import { GoBoardElement } from "./board.element.js";
import { GoStoneElement, StoneColor } from "./stone.element.js";
import { css, html, shadow, ShadowTemplate } from "./templating.js";

const alpha = Array.from(Array(26)).map((_, i) => i + 65);
const alphabet = alpha.map((x) => String.fromCharCode(x));
const regex = /([A-Z])\[([a-z]{2})\]/;

interface Move {
  color: StoneColor;
  space: string;
}

const template: ShadowTemplate = {
  css: css`
    :host {
      display: contents;
    }

    #controls {
      display: none;
    }

    :host([controls]) #controls {
      display: flex;
    }

    form {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    form button {
      cursor: pointer;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      border: solid 1px gray;
    }

    form input {
      padding: 0.5rem 1rem;
      border: solid 1px gray;
      border-radius: 4px;
    }

    label {
      height: 0;
      width: 0;
      position: fixed;
      opacity: 0;
    }
  `,
  html: html`
    <form id="controls">
      <label for="pathOrId">OGS ID or SGF Path:</label>
      <input id="pathOrId" name="pathOrId" placeholder="ogs id or sgf" />

      <button id="run" type="submit" title="play/pause">RUN</button>
      <button id="reset" type="button" title="reset">RESET</button>
    </form>

    <slot></slot>
  `,
};

export class SGFViewerElement extends HTMLElement {
  static observedAttributes = ["ogs-id"];

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

  get isRunning() {
    return this.#isRunning;
  }

  get currentStep() {
    return this.#step;
  }

  moves: Move[] = [];

  #isRunning = false;
  #shadow = shadow(this, template);
  #board: GoBoardElement | null = null;
  #form = this.#shadow.getElementById("controls") as HTMLFormElement;
  #input = this.#shadow.querySelector("input")!;
  #run = this.#shadow.getElementById("run") as HTMLButtonElement;
  #reset = this.#shadow.getElementById("reset") as HTMLButtonElement;
  #step = 0;

  constructor() {
    super();

    // init board
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

    this.#form.addEventListener("submit", (e) => {
      e.preventDefault();

      if (this.#isRunning) {
        this.pause();

        this.#run.innerHTML = "RUN";
        this.#reset.disabled = false;

        return;
      }

      const data = new FormData(this.#form);
      const pathOrId = data.get("pathOrId");

      if (pathOrId) {
        this.#run.innerHTML = "PAUSE";
        this.#reset.disabled = true;

        if (!isNaN(parseInt(pathOrId.toString()))) {
          this.ogsId = pathOrId.toString();
        } else {
          this.path = pathOrId.toString();
        }

        this.go(() => {
          this.#run.innerHTML = "RUN";
          this.#run.disabled = true;
          this.#reset.disabled = false;
        });
      }
    });

    this.#reset.addEventListener("click", () => {
      this.reset();
    });
  }

  attributeChangedCallback() {
    this.#input.value = this.ogsId || this.path;
  }

  async go(cb: () => void) {
    this.#isRunning = true;

    if (this.moves.length) {
      return this.play(cb);
    }

    const path = this.ogsId
      ? `https://online-go.com/api/v1/games/${this.ogsId}/sgf`
      : this.path;

    if (path) {
      const raw = await fetch(path).then((res) => res.text());

      this.moves = this.parseSGF(raw);

      this.play(cb);
    }
  }

  async play(cb: () => void) {
    if (this.#isRunning) {
      if (this.delay > 0 && this.#step + 1 > 0) {
        setTimeout(() => {
          this.next();
          this.play(cb);
        }, this.delay);
      } else {
        this.next();
        this.play(cb);
      }
    }

    if (this.#step >= this.moves.length) {
      this.#step = 0;
      this.moves = [];
      this.#isRunning = false;

      cb();
    }
  }

  next() {
    if (!this.#board) {
      throw new Error("Could not find board element");
    }

    const move = this.moves[this.#step];

    if (move) {
      this.#step += 1;

      const stone = GoStoneElement.create(move.color, move.space);

      this.#board.append(stone);
    }
  }

  pause() {
    this.#isRunning = false;
  }

  reset() {
    this.#isRunning = false;
    this.#step = 0;
    this.moves = [];
    this.#run.disabled = false;

    this.#board?.reset();
  }

  parseSGF(value: string): Move[] {
    if (!this.#board) {
      throw new Error("Could not find board element");
    }

    const moves: Move[] = [];
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
