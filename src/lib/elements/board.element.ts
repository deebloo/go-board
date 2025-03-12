import { inject, injectable } from "@joist/di";
import { attr, css, element, html, listen, query } from "@joist/element";

import { Debug } from "../services/debug.service.js";
import { GoGame } from "../services/game.service.js";
import { type ColumnLabels, DEFAULT_COLUMN_LABELS } from "../util/columns.js";
import { type GoBoard, GoBoardContext } from "../util/context.js";
import type { Sfx } from "../util/sfx.js";
import type { GoStoneElement, StoneColor } from "./stone.element.js";

@injectable({
  name: "go-board-ctx",
  provideSelfAs: [GoBoardContext],
})
@element({
  tagName: "go-board",
  shadowDom: [
    css`
      :host {
        font-family: system-ui;
        box-sizing: border-box;
        background: #fbc467;
        display: block;
        padding: 0;
        position: relative;
        box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.3);
        aspect-ratio: 1/1;
        font-size: clamp(2.5vh, 2.5vw);
      }

      :is(#header > *, .row > :first-child) {
        visibility: hidden;
      }

      :host([coords]) {
        padding: 1rem 0 0 1rem;
      }

      :host([coords]) :is(#header > *, .row > *:first-child) {
        visibility: visible;
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
        transform: translate(-50%, -10px);
      }

      .row board-spacer {
        border-color: transparent;
        transform: translate(-10px, -50%);
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

      .row slot::slotted(go-marker) {
        position: absolute;
        transform: translate(-50%, -50%);
        padding: 0;
        height: 98%;
        width: 98%;
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

      .row slot::slotted(go-stone),
      .row slot::slotted(go-marker) {
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

      :host(:not([disablelastmarker]))
        .row
        slot::slotted(go-stone:last-of-type)::after {
        content: "";
        height: 50%;
        width: 50%;
        border-radius: 50%;
        border: solid 2px;
        position: absolute;
      }

      :host .row slot::slotted(go-stone[color="white"]:last-child)::after {
        border-color: #000;
      }

      :host .row slot::slotted(go-stone[color="black"]:last-child)::after {
        border-color: #fff;
      }

      .row slot button {
        border: none;
        opacity: 0;
        cursor: pointer;
        z-index: 1;
      }

      .row slot button:hover {
        background: none;
        opacity: 0.85 !important;
      }

      .row slot button:after {
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

      :host([readonly]) .row slot button {
        cursor: default;
      }

      :host([readonly]) .row slot button:hover:after {
        background: none !important;
      }
    `,
    html`
      <div id="header" class="row">
        <board-spacer></board-spacer>
      </div>
    `,
  ],
})
export class GoBoardElement extends HTMLElement implements GoBoard {
  static formAssociated = true;

  @attr()
  accessor turn: StoneColor = "black";

  @attr()
  accessor debug = false;

  @attr()
  accessor rows = 19;

  @attr()
  accessor cols = 19;

  @attr()
  accessor coords = false;

  @attr()
  accessor readonly = false;

  @attr()
  accessor novalidate = false;

  sfx: Sfx | null = null;
  // when stones are added or removed this map is updated. This holds a reference to all stones on the board and which space they are in.
  // this makes state calculations very cheap. the stone added/removed lifecycle callbacks keep this map in state.
  spaces = new Map<string, GoStoneElement | null>();
  columnLabels: ColumnLabels = [...DEFAULT_COLUMN_LABELS];
  previousKey: string | null = null;
  currentKey: string | null = null;

  #debug = inject(Debug);
  #game = inject(GoGame);
  #internals = this.attachInternals();
  #header = query("#header");

  constructor() {
    super();

    this.#internals.setFormValue(this.currentKey);
  }

  connectedCallback() {
    this.#createBoard();
    this.#createColumnLetters();

    const debug = this.#debug();

    this.debug = debug.enabled;
  }

  registerStone(stone: GoStoneElement) {
    const game = this.#game();

    this.turn = stone.color;

    this.spaces.set(stone.slot, stone);

    if (this.novalidate) {
      this.turn = stone.color === "black" ? "white" : "black";
    } else {
      game.validateStonePlacement(this, stone, () => {
        this.#internals.setFormValue(this.currentKey);
      });
    }
  }

  unregisterStone(stone: GoStoneElement) {
    this.spaces.set(stone.slot, null);
  }

  @listen("click")
  onClick(e: Event) {
    if (this.readonly) {
      return;
    }

    if (e.target instanceof HTMLButtonElement) {
      const stone = document.createElement("go-stone");
      stone.color = this.turn;
      stone.slot = e.target.id;

      this.append(stone);

      if (this.sfx) {
        this.sfx.placeStone();
      }
    }
  }

  createKey() {
    let key = "";

    for (const [space, stone] of this.spaces) {
      if (stone !== null) {
        key += stone.color[0].toUpperCase() + space;
      } else {
        key += "*";
      }
    }

    return key;
  }

  reset() {
    this.innerHTML = "";

    for (const [key] of this.spaces) {
      this.spaces.set(key, null);
    }

    this.currentKey = this.createKey();
    this.previousKey = "";
    this.turn = "black";
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

      this.shadowRoot?.append(row);
    }
  }

  #createColumnLetters() {
    for (let r = 0; r < this.rows; r++) {
      const col = document.createElement("div");
      const letter = document.createElement("span");
      letter.innerHTML = this.columnLabels[r];

      col.append(letter);

      this.#header().append(col);
    }
  }

  #createSlot(row: number, column: number) {
    const slot = document.createElement("slot");
    slot.name = `${this.columnLabels[column]}${this.rows - row}`;

    this.spaces.set(slot.name, null);

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
