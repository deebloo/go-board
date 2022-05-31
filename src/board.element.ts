import { Injected, injectable } from "@joist/di";
import { css, styled } from "@joist/styled";
import { observable, attr, observe } from "@joist/observable";
import { query } from "@joist/query";

import { Debug } from "./go.ctx";
import { GoStoneElement, StoneColor } from "./stone.element";
import { arr, num } from "./attributes";

const template = document.createElement("template");
template.innerHTML = /*html*/ `
  <div id="header" class="row">
    <spacer></spacer>
  </div>
`;

export class BoardEvent extends Event {
  constructor(public space: string) {
    super("goboard", { bubbles: true });
  }
}

@observable
@styled
@injectable
export class GoBoardElement extends HTMLElement {
  static inject = [Debug];

  static styles = [
    css`
      :host {
        box-sizing: border-box;
        background: #caa472;
        display: inline-block;
        padding: 1rem;
        position: relative;
        box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.3);
        aspect-ratio: 1/1;
        font-size: clamp(0.5rem, 2vw, 2.1rem);
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

      .row spacer {
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
  ];

  @observe @num rows = 19;
  @observe @num cols = 19;
  @observe @attr static = true;
  @observe @attr showCoords = true;
  @observe @attr turn: StoneColor = "black";
  @observe @arr columnLabels = [
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

  @query("#header") header!: HTMLDivElement;

  constructor(private debug: Injected<Debug>) {
    super();

    const root = this.attachShadow({ mode: "open" });

    root.addEventListener("slotchange", this.onSlotChange.bind(this));
    root.addEventListener("click", this.onClick.bind(this));
    root.addEventListener("drop", this.onDrop.bind(this));
  }

  connectedCallback() {
    // only create board  once
    if (this.shadowRoot!.children.length) {
      return;
    }

    this.shadowRoot!.appendChild(template.content.cloneNode(true));

    if (this.rows > 19 || this.cols > 19) {
      throw new Error("Cannot create a board size greater then 19");
    }

    this.createBoard();
    this.createColumnLetters();
  }

  key(): Promise<Uint8Array> {
    const stones = this.querySelectorAll<GoStoneElement>("go-stone");
    const keyString = Array.from(stones).reduce(
      (key, { slot, color }) => `${key}${slot}${color}`,
      ""
    );

    return crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(keyString))
      .then((res) => new Uint8Array(res));
  }

  clear() {
    this.innerHTML = "";
  }

  copyToClipboard() {
    return navigator.clipboard.writeText(this.outerHTML);
  }

  private onSlotChange(e: Event) {
    const target = e.target as HTMLSlotElement;

    if (!this.static) {
      target.assignedElements().forEach((stone) => {
        if (stone instanceof GoStoneElement) {
          stone.draggable = true;
        }
      });
    }
  }

  private onClick(e: Event) {
    if (e.target instanceof HTMLButtonElement) {
      this.dispatchEvent(new BoardEvent(e.target.id));
    }
  }

  private onDrop(evt: Event) {
    const e = evt as DragEvent;
    const currentLocation = e.dataTransfer!.getData("stone");
    const debug = this.debug();
    const btn = e.target as HTMLButtonElement;
    const stone = this.querySelector<HTMLSlotElement>(
      `[slot="${currentLocation}"]`
    );

    if (stone) {
      debug.log(`stone ${stone!.slot} moved to ${btn.id}`);

      stone.slot = btn.id;
    } else {
      debug.log(`Could not find stone`);
    }
  }

  private createBoard() {
    for (let r = 0; r < this.rows; r++) {
      const row = document.createElement("div");
      row.className = "row";

      const spacer = document.createElement("spacer");
      row.appendChild(spacer);

      spacer.innerHTML = `<span>${(this.rows - r).toString()}</span>`;

      for (let c = 0; c < this.cols; c++) {
        row.appendChild(this.createSlot(r, c));
      }

      this.shadowRoot!.appendChild(row);
    }
  }

  private createColumnLetters() {
    for (let r = 0; r < this.rows; r++) {
      const col = document.createElement("div");
      const letter = document.createElement("span");
      letter.innerHTML = this.columnLabels[r];

      col.appendChild(letter);

      this.header.appendChild(col);
    }
  }

  private createSlot(r: number, c: number) {
    const debug = this.debug();

    const slot = document.createElement("slot");
    slot.name = `${this.columnLabels[c]}${this.rows - r}`;

    const spacing = Math.floor(this.rows / 3);
    const start = Math.floor(this.rows / 4) - 1;

    const spaces = [start, start + spacing, start + spacing * 2];

    if (spaces.includes(r) && spaces.includes(c)) {
      slot.classList.add("starpoint");
    }

    const btn = document.createElement("button");
    btn.id = slot.name;

    if (!this.static) {
      btn.ondragover = (e) => e.preventDefault();
    }

    debug.eval(() => {
      btn.style.opacity = ".2";
    });

    slot.appendChild(btn);

    return slot;
  }
}
