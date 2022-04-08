import { Injected } from "@joist/di";
import { injectable } from "@joist/di/dom";
import { css, styled } from "@joist/styled";
import { observable, attr, observe } from "@joist/observable";
import { query } from "@joist/query";

import { Debug, GoConfig } from "./go.ctx";
import { StoneColor } from "./stone.element";

const template = document.createElement("template");
template.innerHTML = /*html*/ `
  <div id="header"></div>

  <div id="container"></div>

  <div id="sidebar"></div>
`;

const num = attr({ read: Number });
const alpha = Array.from(Array(26)).map((_, i) => i + 65);
export const alphabet = alpha.map((x) => String.fromCharCode(x));

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
        background: #dcb35c;
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
        height: 47px;
        width: 47px;
      }

      .row slot::slotted(go-stone) {
        cursor: grab;
      }

      .row slot::slotted(go-stone:active) {
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

  @observe @num rows: number = 19;
  @observe @num cols: number = 19;
  @observe @attr static = true;
  @observe @attr turn: StoneColor = "black";

  @query("#header") header!: HTMLDivElement;
  @query("#container") container!: HTMLDivElement;
  @query("#sidebar") sidebar!: HTMLDivElement;

  constructor(
    private config: Injected<GoConfig>,
    private debug: Injected<Debug>
  ) {
    super();

    const root = this.attachShadow({ mode: "open" });

    root.addEventListener("click", (e) => {
      if (e.target instanceof HTMLButtonElement) {
        this.dispatchEvent(new BoardEvent(e.target.id));
      }
    });

    root.addEventListener("drop", (evt) => {
      const e = evt as DragEvent;
      const currentLocation = e.dataTransfer!.getData("stone");

      const btn = e.target as HTMLButtonElement;
      const stone = this.querySelector<HTMLSlotElement>(
        `[slot="${currentLocation}"]`
      );

      if (stone) {
        this.debug().log(`stone ${stone!.slot} moved to ${btn.id}`);

        stone!.slot = btn.id;
      } else {
        this.debug().log(`Could not find stone`);
      }
    });
  }

  connectedCallback() {
    this.shadowRoot!.appendChild(template.content.cloneNode(true));

    this.createBoard();
    this.createRowNumbers();
    this.createColumnLetters();
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
      col.innerHTML = alphabet[r];

      this.header.appendChild(col);
    }
  }

  private createSlot(r: number, c: number) {
    const slot = document.createElement("slot");
    slot.name = `${alphabet[c]}${this.rows - r}`;

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
