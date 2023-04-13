import { css, html, shadow, ShadowTemplate } from "./templating.js";
import { debug } from "./debug.js";
import { GoStoneElement, StoneColor } from "./stone.element.js";
import { findAttachedEnemyStones, findGroup } from "./game.js";

const template: ShadowTemplate = {
  css: css`
    :host {
      box-sizing: border-box;
      background: #dcb35c;
      display: block;
      padding: 1rem;
      position: relative;
      box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.3);
      aspect-ratio: 1/1;
      font-size: clamp(2.5vh, 2.5vw);
    }

    :host([show-coords="false"]) #header > * {
      visibility: hidden;
    }

    :host([show-coords="false"]) .row > *:first-child {
      visibility: hidden;
    }

    * {
      box-sizing: border-box;
      font-family: inherit;
    }

    .row {
      display: flex;
      width: 100%;
    }

    .row > * {
      align-items: center;
      justify-content: center;
      border-top: solid 1px #000;
      border-left: solid 1px #000;
      display: flex;
      flex-grow: 1;
      aspect-ratio: 1/1;
      position: relative;
    }

    .row > * > * {
      position: absolute;
    }

    #header > * {
      border-color: transparent;
      transform: translate(-50%, -30%);
    }

    .row board-spacer {
      border-color: transparent;
      transform: translate(-30%, -50%);
    }

    .row:last-child slot {
      border-color: transparent;
      border-top: solid 1px #000;
    }

    .row slot:last-child {
      border-color: transparent;
      border-left: solid 1px #000;
    }

    .row:last-child slot:last-child {
      border-color: transparent;
    }

    .row slot::slotted(go-stone),
    .row slot button {
      position: absolute;
      transform: translate(-50%, -50%);
      padding: 0;
      height: 98%;
      width: 98%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .row slot::slotted(go-stone) {
      z-index: 1000;
    }

    .row slot.starpoint:after {
      content: "";
      display: block;
      height: 25%;
      width: 25%;
      background: #000;
      border-radius: 50%;
      position: absolute;
      transform: translate(-50%, -50%);
      top: 0;
      left: 0;
    }

    .row slot::slotted(go-stone:last-child)::after {
      content: "";
      height: 50%;
      width: 50%;
      border-radius: 50%;
      border: solid 2px;
    }

    .row slot::slotted(go-stone[color="white"]:last-child)::after {
      border-color: #000;
    }

    .row slot::slotted(go-stone[color="black"]:last-child)::after {
      border-color: #fff;
    }

    .row slot button {
      border: none;
      opacity: 0;
      cursor: pointer;
      z-index: 1;
    }

    :host .row slot button:hover {
      background: none;
      opacity: 0.85 !important;
    }

    :host .row slot button:after {
      content: "";
      display: block;
      border-radius: 50%;
      height: 100%;
      width: 100%;
    }

    :host([turn="black"]) .row slot button:hover:after {
      background: #000;
    }

    :host([turn="white"]) .row slot button:hover:after {
      background: #fff;
    }

    :host([debug]) button {
      opacity: 0.2;
    }
  `,
  html: html`
    <div id="header" class="row">
      <board-spacer></board-spacer>
    </div>
  `,
};

export class GoBoardElement extends HTMLElement {
  static observedAttributes = ["debug"];

  get turn() {
    return (this.getAttribute("turn") as StoneColor) || "black";
  }

  set turn(value: StoneColor) {
    this.setAttribute("turn", value);
  }

  get mode() {
    return this.getAttribute("mode") || "game";
  }

  set mode(value) {
    this.setAttribute("mode", value);
  }

  rows = 19;
  cols = 19;
  columnLabels = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ];

  #shadow = shadow(this, template);
  // when stones are added or removed this map is updated. This holds a reference to all stones on the board and which space they are in.
  // this makes state calculations very cheap. the stone added/removed lifecycle callbacks keep this map in state.
  #spaces = new Map<string, GoStoneElement | null>();
  #header = this.#shadow.getElementById("header")!;
  #prevKey = "";
  #currentKey = this.key();

  constructor() {
    super();

    this.#shadow.addEventListener("click", this.#onClick.bind(this));

    this.#createBoard();
    this.#createColumnLetters();
  }

  attributeChangedCallback() {
    if (this.hasAttribute("debug")) {
      debug.enable();
    } else {
      debug.disable();
    }
  }

  connectedCallback() {
    if (!this.hasAttribute("turn")) {
      this.turn = "black";
    }
  }

  onStoneAdded(stone: GoStoneElement) {
    this.turn = stone.color;

    this.#spaces.set(stone.slot, stone);

    if (this.mode === "game") {
      this.#validateStonePlacement(stone);
    }
  }

  onStoneRemoved(stone: GoStoneElement) {
    this.#spaces.set(stone.slot, null);
  }

  key() {
    let key = "";

    for (let [space, stone] of this.#spaces) {
      if (stone !== null) {
        key += space + stone.color[0].toUpperCase();
      } else {
        key += "*";
      }
    }

    return btoa(key);
  }

  reset() {
    this.innerHTML = "";

    for (let [key] of this.#spaces) {
      this.#spaces.set(key, null);
    }

    this.#currentKey = this.key();
    this.#prevKey = "";
    this.turn = "black";
  }

  getSpace(space: string) {
    return this.#spaces.get(space);
  }

  copyToClipboard() {
    return navigator.clipboard.writeText(this.outerHTML);
  }

  #validateStonePlacement(stone: GoStoneElement) {
    debug.group("Checking stone:", stone);

    // find all attached enemies
    const enemies = findAttachedEnemyStones(this, stone);

    debug.log("Finding enemy stones:", enemies);

    // keep track of removed stones
    const removedStones: GoStoneElement[] = [];

    // for each enemy stone check its group and liberties.
    for (let enemy of enemies) {
      const group = findGroup(this, enemy);

      // if a group has no liberties remove all of its stones
      if (!group.liberties.size) {
        debug.log("Removing Stones:\n", ...group.stones);

        for (let stone of group.stones) {
          this.#spaces.set(stone.slot, null); // clear out stone
          removedStones.push(stone); // keep track of removed stones
        }
      }
    }

    const key = this.key();

    if (this.#currentKey === key || this.#prevKey === key) {
      // If the current board state has already existed the move is not allowed

      // reset the board state by adding removed stones back
      for (let stone of removedStones) {
        this.#spaces.set(stone.slot, stone);
      }

      // remove the previously placed stone
      stone.remove();

      // notify the user
      alert("Move is not allowed: " + stone.slot + stone.color);
    } else {
      // board state is valid and we can proceed

      // remove captured stones from dom
      for (let stone of removedStones) {
        stone.remove();
      }

      // find added stones group
      const group = findGroup(this, stone);

      debug.log("Stone part of following group:", group);

      // if the current group has no liberties remove it. not allowed
      if (!group.liberties.size) {
        stone.remove();

        alert("Move is suicidal!");
      } else {
        this.turn = stone.color === "black" ? "white" : "black";

        // track current and previous board key
        this.#prevKey = this.#currentKey;
        this.#currentKey = key;
      }
    }

    debug.groupEnd();
  }

  #onClick(e: Event) {
    if (e.target instanceof HTMLButtonElement) {
      const stone = GoStoneElement.create(this.turn, e.target.id);

      this.append(stone);
    }
  }

  #createBoard() {
    for (let r = 0; r < this.rows; r++) {
      const row = document.createElement("div");
      row.className = "row";

      const spacer = document.createElement("board-spacer");
      row.append(spacer);

      const span = document.createElement("span");
      span.innerHTML = (this.rows - r).toString();

      spacer.append(span);

      for (let c = 0; c < this.cols; c++) {
        row.append(this.#createSlot(r, c));
      }

      this.#shadow.append(row);
    }
  }

  #createColumnLetters() {
    for (let r = 0; r < this.rows; r++) {
      const col = document.createElement("div");
      const letter = document.createElement("span");
      letter.innerHTML = this.columnLabels[r];

      col.append(letter);

      this.#header.append(col);
    }
  }

  #createSlot(row: number, column: number) {
    const slot = document.createElement("slot");
    slot.name = `${this.columnLabels[column]}${this.rows - row}`;

    this.#spaces.set(slot.name, null);

    const spacing = Math.floor(this.rows / 3);
    const start = Math.floor(this.rows / 4) - 1;
    const spaces = [start, start + spacing, start + spacing * 2];

    // Define which spaces should be decorated as a starpoint
    if (spaces.includes(row) && spaces.includes(column)) {
      slot.classList.add("starpoint");
    }

    const btn = document.createElement("button");
    btn.title = slot.name;
    btn.id = slot.name;

    slot.append(btn);

    return slot;
  }
}
