import { Injected } from "@joist/di";
import { injectable } from "@joist/di/dom";
import { css, styled } from "@joist/styled";
import { observable, attr, observe } from "@joist/observable";
import { query } from "@joist/query";

import { Debug, GoConfig } from "./go.ctx";
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
  static inject = [GoConfig, Debug];

  static styles = [
    css`
      :host {
        background: #caa472;
        display: inline-block;
        padding: 4rem;
        position: relative;
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
        width: 50px;
        height: 4rem;
        justify-content: center;
        font-size: 1.5rem;
        font-family: system-ui;
        transform: translateX(-50%);
      }

      #container {
        display: inline-flex;
        flex-direction: column;
        border-top: solid 1px #000;
        border-left: solid 1px #000;
      }

      #sidebar {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 4rem;
        left: 0;
      }

      #sidebar > * {
        align-items: center;
        display: flex;
        width: 4rem;
        height: 50px;
        justify-content: center;
        font-size: 1.5rem;
        font-family: system-ui;
        transform: translateY(-50%);
      }

      .row {
        display: flex;
      }

      .row:last-child slot {
        height: 0;
        border: none;
      }

      .row slot {
        border-bottom: solid 1px #000;
        border-right: solid 1px #000;
        display: block;
        height: 50px;
        width: 50px;
        position: relative;
      }

      .row slot:last-child {
        width: 0;
        border: none;
      }

      .row slot::slotted(go-stone),
      .row slot button {
        position: absolute;
        transform: translate(-50%, -50%);
        height: 48px;
        width: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .row slot::slotted(go-stone:last-child)::after {
        content: "";
        height: 25px;
        width: 25px;
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
      }

      :host([turn="black"]) .row slot button:hover {
        background: #000;
        opacity: 0.75 !important;
        border-radius: 50%;
      }

      :host([turn="white"]) .row slot button:hover {
        background: #fff;
        opacity: 0.75 !important;
        border-radius: 50%;
      }
    `,
  ];

  @observe @attr({ read: Number }) rows: number = 19;
  @observe @attr({ read: Number }) cols: number = 19;
  @observe @attr static = true;
  @observe @attr coords = true;
  @observe @attr turn: StoneColor = "black";

  @observe @attr columnLabels = [
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

  constructor(
    private config: Injected<GoConfig>,
    private debug: Injected<Debug>
  ) {
    super();

    const root = this.attachShadow({ mode: "open" });

    root.addEventListener("slotchange", this.onSlotChange.bind(this));
    root.addEventListener("click", this.onClick.bind(this));
    root.addEventListener("drop", this.onDrop.bind(this));
  }

  connectedCallback() {
    this.shadowRoot!.appendChild(template.content.cloneNode(true));

    this.createBoard();

    if (this.coords) {
      this.createRowNumbers();
      this.createColumnLetters();
    }
  }

  private onSlotChange(e: Event) {
    const target = e.target as HTMLSlotElement;

    target.assignedElements().forEach((stone) => {
      if (stone instanceof GoStoneElement && !this.static) {
        stone.draggable = true;
      }
    });
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
    const slot = document.createElement("slot");
    slot.name = `${this.columnLabels[c]}${this.rows - r}`;

    const btn = document.createElement("button");
    btn.id = slot.name;

    if (!this.static) {
      btn.ondragover = (e) => e.preventDefault();
    }

    if (this.config().debug) {
      btn.style.opacity = ".2";
    }

    slot.appendChild(btn);

    return slot;
  }
}
