import { Injected } from "@joist/di";
import { injectable } from "@joist/di/dom";
import { css, styled } from "@joist/styled";
import { observable, attr, observe } from "@joist/observable";
import { query } from "@joist/query";

import { Debug } from "./go.ctx";
import { GoStoneElement, StoneColor } from "./stone.element";

const template = document.createElement("template");
template.innerHTML = /*html*/ `
  <div id="header"></div>

  <div id="container"></div>

  <div id="sidebar"></div>
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
        padding: 4rem 0 0 4rem;
        position: relative;
        box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.3);
        aspect-ratio: 1/1;
      }

      * {
        box-sizing: border-box;
      }

      #header {
        display: flex;
        position: absolute;
        left: 4rem;
        right: 0;
        top: 0;
      }

      #header > * {
        align-items: center;
        display: flex;
        height: 4rem;
        justify-content: center;
        font-size: 1.5rem;
        font-family: system-ui;
        transform: translateX(-50%);
        flex-grow: 1;
      }

      #container {
        display: inline-flex;
        flex-direction: column;
        width: 100%;
      }

      #sidebar {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 4rem;
        left: 0;
        bottom: 0;
      }

      #sidebar > * {
        align-items: center;
        display: flex;
        width: 4rem;
        flex-grow: 1;
        justify-content: center;
        font-size: 1.5rem;
        font-family: system-ui;
        transform: translateY(-50%);
      }

      .row {
        display: flex;
        width: 100%;
      }

      .row slot {
        border-top: solid 1px #000;
        border-left: solid 1px #000;
        display: block;
        flex-grow: 1;
        aspect-ratio: 1/1;
        position: relative;
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
        height: 10px;
        width: 10px;
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

      @media (max-width: 900px) {
        #header > *,
        #sidebar > * {
          font-size: 1rem;
        }
      }

      @media (min-width: 1500px) {
        #header > *,
        #sidebar > * {
          font-size: 1.75rem;
        }
      }
    `,
  ];

  @observe @attr<number>({ read: Number }) rows = 19;
  @observe @attr<number>({ read: Number }) cols = 19;
  @observe @attr static = true;
  @observe @attr coords = true;
  @observe @attr turn: StoneColor = "black";

  @observe
  @attr<string[]>({
    read: (val) => val.split(","),
    write: (val) => val.join(","),
  })
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

  @query("#header") header!: HTMLDivElement;
  @query("#container") container!: HTMLDivElement;
  @query("#sidebar") sidebar!: HTMLDivElement;

  constructor(private debug: Injected<Debug>) {
    super();

    const root = this.attachShadow({ mode: "open" });

    root.addEventListener("slotchange", this.onSlotChange.bind(this));
    root.addEventListener("click", this.onClick.bind(this));
    root.addEventListener("drop", this.onDrop.bind(this));
  }

  connectedCallback() {
    // only create board  once
    if (!this.shadowRoot!.children.length) {
      this.shadowRoot!.appendChild(template.content.cloneNode(true));

      if (this.rows > 19 || this.cols > 19) {
        throw new Error("Cannot create a board size greater then 19");
      }

      this.createBoard();

      if (this.coords) {
        this.createRowNumbers();
        this.createColumnLetters();
      }
    }
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

      for (let c = 0; c < this.cols; c++) {
        row.appendChild(this.createSlot(r, c));
      }

      this.container.appendChild(row);
    }
  }

  private createRowNumbers() {
    for (let r = 0; r < this.rows; r++) {
      const row = document.createElement("div");
      row.innerHTML = (this.rows - r).toString();

      this.sidebar.appendChild(row);
    }
  }

  private createColumnLetters() {
    for (let r = 0; r < this.rows; r++) {
      const col = document.createElement("div");
      col.innerHTML = this.columnLabels[r];

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
