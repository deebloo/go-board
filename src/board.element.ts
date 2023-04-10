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
      transform: translate(-50%, -20%);
      margin-bottom: 10px;
    }

    .row board-spacer {
      border-color: transparent;
      transform: translate(-20%, -50%);
      margin-right: 10px;
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
  #spaces = new Map<string, GoStoneElement | null>();
  #header = this.#shadow.getElementById("header")!;
  #pastStates = new Set<string>();

  prevKey = "";
  currentKey = "";

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

    stone.slot = stone.space;

    this.#spaces.set(stone.space, stone);

    if (this.mode === "game") {
      this.#validateStonePlacement(stone);
    }
  }

  onStoneRemoved(stone: GoStoneElement) {
    this.#spaces.set(stone.space, null);
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
    this.#pastStates.clear();

    for (let [key] of this.#spaces) {
      this.#spaces.set(key, null);
    }

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
          this.#spaces.set(stone.space, null); // clear out stone
          removedStones.push(stone); // keep track of removed stones
        }
      }
    }

    const key = this.key();

    if (this.currentKey === key || this.prevKey === key) {
      // If the current board state has already existed the move is not allowed

      // reset the board state by adding removed stones back
      for (let stone of removedStones) {
        this.#spaces.set(stone.space, stone);
      }

      console.log(atob(this.prevKey));
      console.log(atob(this.currentKey));
      console.log(atob(key));

      // remove the previously placed stone
      stone.remove();

      // notify the user
      alert("Move is not allowed: " + stone.space + stone.color);
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
        this.prevKey = this.currentKey;
        this.currentKey = key;
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

//*****F19WG19WH19B*K19W***O19B*********E18WF18WG18B*J18BK18BL18WM18WN18B*P18B*R18B**A17WB17WC17WD17WE17WF17BG17BH17BJ17BK17BL17W*N17WO17B*Q17B*S17BT17BA16WB16BC16BD16B*F16B*H16BJ16WK16BL16W*N16WO16WP16BQ16WR16BS16BT16BA15B*C15B**F15BG15WH15BJ15WK15W*M15BN15WO15BP15BQ15WR15WS15WT15BA14BB14BC14BD14BE14B*G14WH14W**L14WM14WN14WO14WP14BQ14W*S14WT14BA13BB13WC13WD13WE13BF13BG13W**K13WL13BM13WN13BO13BP13BQ13WR13WS13WT13BA12W*C12WD12BE12BF12W***K12WL12BM12BN12B**Q12BR12W*T12W**C11WD11WE11BF11WG11WH11W*K11WL11WM11B*O11BP11BQ11BR11BS11W***C10BD10WE10BF10WG10BH10WJ10BK10WL10BM10B*O10BP10WQ10BR10W****C9WD9WE9BF9BG9BH9BJ9WK9W*M9BN9BO9WP9WQ9WR9W****C8WD8BE8B*G8BH8BJ8BK8WL8WM8BN8W******A7WB7WC7WD7WE7WF7B***K7B*M7W**P7W*R7WS7WT7WA6BB6WC6BD6WE6B*G6BH6BJ6WK6BL6BM6BN6WO6WP6WQ6WR6BS6WT6BA5BB5B*D5BE5BF5B*H5BJ5BK5WL5WM5WN5BO5W*Q5WR5BS5BT5B****E4BF4WG4BH4WJ4WK4W*M4BN4BO4BP4W*R4B******E3WF3WG3W**K3WL3BM3B*O3BP3B*******D2BE2W*G2W*J2W*L2WM2BN2B*********D1BE1BF1W****L1WM1WN1B******
//*****F19WG19WH19B*K19W***O19B*********E18WF18WG18B*J18BK18BL18WM18WN18B*P18B*R18B**A17WB17WC17WD17WE17WF17BG17BH17BJ17BK17BL17W*N17WO17B*Q17B*S17BT17BA16WB16BC16BD16B*F16B*H16BJ16WK16BL16W*N16WO16WP16BQ16WR16BS16BT16BA15B*C15B**F15BG15WH15BJ15WK15W*M15BN15WO15BP15BQ15WR15WS15WT15BA14BB14BC14BD14BE14B*G14WH14W**L14WM14WN14WO14WP14BQ14W*S14WT14BA13BB13WC13WD13WE13BF13BG13W**K13WL13BM13WN13BO13BP13BQ13WR13WS13WT13BA12W*C12WD12BE12BF12W***K12WL12BM12BN12B**Q12BR12W*T12W**C11WD11WE11BF11WG11WH11W*K11WL11WM11B*O11BP11BQ11BR11BS11W***C10BD10WE10BF10WG10BH10WJ10BK10WL10BM10B*O10BP10WQ10BR10W****C9WD9WE9BF9BG9BH9BJ9WK9W*M9BN9BO9WP9WQ9WR9W****C8WD8BE8B*G8BH8BJ8BK8WL8WM8BN8W******A7WB7WC7WD7WE7WF7B***K7B*M7W**P7W*R7WS7WT7WA6BB6WC6BD6WE6B*G6BH6BJ6WK6BL6BM6BN6WO6WP6WQ6WR6BS6WT6BA5BB5B*D5BE5BF5B*H5BJ5BK5WL5WM5WN5BO5W*Q5WR5BS5BT5B****E4BF4WG4BH4WJ4WK4W*M4BN4BO4BP4W*R4B******E3WF3WG3W**K3WL3BM3B*O3BP3B*******D2BE2W*G2W*J2W*L2WM2BN2B*********D1BE1BF1W****L1WM1WN1B******
