import { css, html, shadow, ShadowTemplate } from "./templating.js";
import { debug } from "./debug.js";
import { GoStoneElement, StoneColor } from "./stone.element.js";
import { findAttachedEnemyStones, findGroup } from "./game.js";

const template: ShadowTemplate = {
  css: css`
    :host {
      box-sizing: border-box;
      background: #caa472;
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
      transform: translate(-50%, -20%);
    }

    .row board-spacer {
      border-color: transparent;
      transform: translate(-20%, -50%);
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

    .row slot::slotted(go-stone[draggable="true"]) {
      cursor: grab;
    }

    .row slot::slotted(go-stone[draggable="true"]:active) {
      cursor: grabbing;
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
  `,
  html: html`
    <div id="header" class="row">
      <board-spacer></board-spacer>
    </div>
  `,
};

export class GoBoardElement extends HTMLElement {
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
  #header = this.#shadow.getElementById("header")!;
  #pastStates = new Set<string>();

  constructor() {
    super();

    this.#shadow.addEventListener("click", this.#onClick.bind(this));

    if (!this.hasAttribute("turn")) {
      this.turn = "black";
    }

    this.#createBoard();
    this.#createColumnLetters();
  }

  onStoneAdded(stone: GoStoneElement) {
    this.turn = stone.color;

    stone.slot = stone.space;

    if (this.mode === "game") {
      this.#validateStonePlacement(stone);
    }
  }

  key() {
    const stones: GoStoneElement[] = [];

    for (let stone of this.children) {
      if (stone instanceof GoStoneElement && stone.slot) {
        stones.push(stone);
      }
    }

    stones.sort(stoneSort);

    let key = "";

    for (let stone of stones) {
      key += stone.slot + stone.color;
    }

    return key;
  }

  reset() {
    this.innerHTML = "";
    this.#pastStates.clear();
    this.turn = "black";
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
          // stones are removed by removing it's assinged slot
          // this allows the game to use stones to track game progress
          stone.removeAttribute("slot");

          // keep track of removed stones
          removedStones.push(stone);
        }
      }
    }

    const key = this.key();

    if (this.#pastStates.has(key)) {
      // If the current board state has already existed the move is not allowed

      // Add the removed stones back
      for (let stone of removedStones) {
        stone.slot = stone.space;
      }

      alert("Move is not allowed");

      // remove the previously placed stone
      stone.remove();
    } else {
      // keep track of previous board states
      this.#pastStates.add(key);

      // find added stones group
      const group = findGroup(this, stone);

      debug.log("Stone part of following group:", group);

      // if the current group has no liberties remove it. not allowed
      if (!group.liberties.size) {
        stone.remove();

        alert("Move is suicidal!");
      } else {
        this.turn = stone.color === "black" ? "white" : "black";
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
      row.appendChild(spacer);

      const span = document.createElement("span");
      span.innerHTML = (this.rows - r).toString();

      spacer.append(span);

      for (let c = 0; c < this.cols; c++) {
        row.appendChild(this.#createSlot(r, c));
      }

      this.shadowRoot!.appendChild(row);
    }
  }

  #createColumnLetters() {
    for (let r = 0; r < this.rows; r++) {
      const col = document.createElement("div");
      const letter = document.createElement("span");
      letter.innerHTML = this.columnLabels[r];

      col.appendChild(letter);

      this.#header.appendChild(col);
    }
  }

  #createSlot(row: number, column: number) {
    const slot = document.createElement("slot");
    slot.name = `${this.columnLabels[column]}${this.rows - row}`;

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

    debug.eval(() => {
      btn.style.opacity = ".2";
    });

    slot.appendChild(btn);

    return slot;
  }
}

function stoneSort(a: GoStoneElement, b: GoStoneElement) {
  const coordsA = parseCoords(a.slot);
  const coordsB = parseCoords(b.slot);

  const colComparrison = coordsA.col.localeCompare(coordsB.col);

  if (colComparrison !== 0) {
    return colComparrison;
  }

  return Number(coordsA.row) - Number(coordsB.row);
}

function parseCoords(space: string) {
  const array = space.split("");

  return {
    col: array.shift() as string,
    row: array.join(""),
  };
}
