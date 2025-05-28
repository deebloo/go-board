import "@joist/templating/define.js";

import { inject, injectable } from "@joist/di";
import { attr, css, element, html, listen } from "@joist/element";
import { bind } from "@joist/templating";

import { Debug } from "../services/debug.service.js";
import { GoGame } from "../services/game.service.js";
import { COLUMN_LABELS } from "../util/columns.js";
import { type GoBoard, GoBoardContext } from "../util/context.js";
import type { Sfx } from "../util/sfx.js";
import type { GoStoneElement, StoneColor } from "./stone.element.js";

export interface Cell {
  row: number;
  col: number;
  slot: string;
}

@injectable({
  name: "go-board-ctx",
  provideSelfAs: [GoBoardContext],
})
@element({
  tagName: "go-board",
  shadowDom: [
    css`
      * {
        box-sizing: border-box;
      }

      :host {
        font-family: system-ui;
        box-sizing: border-box;
        background: #fbc467;
        display: block;
        padding: 0;
        position: relative;
        box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.3);
        aspect-ratio: 1/1;
      }

      #container {
        display: grid;
        width: 100%;
        height: 100%;
        grid-template-columns: repeat(19, 1fr);
        padding-top: calc(100% / 19);
        padding-left: calc(100% / 19);
      }

      #container > j-for-scope {
        align-items: center;
        justify-content: center;
        border-top: solid 1px #000;
        border-left: solid 1px #000;
        display: flex;
        flex-grow: 1;
        aspect-ratio: 1/1;
        position: relative;
      }

      #container > j-for-scope slot {
        display: block;
        position: absolute;
        height: 100%;
        width: 100%;
        transform: translate(-50%, -50%);
        top: 0;
        left: 0;
      }

      #container > j-for-scope slot::slotted(*) {
        width: 98%;
        height: 98%;
        position: absolute;
      }

      #container > j-for-scope button {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        border-radius: 50%;
        border: none;
        transform: translate(-50%, -50%);
        opacity: 0;
        cursor: pointer;
        background-color: #fff;
        z-index: 1;
      }

      #container > j-for-scope button:hover {
        opacity: .5;
      }

      :host([turn="black"]) #container > j-for-scope button {
        background-color: #000;
      }

      #container > j-for-scope:nth-of-type(19n) {
        border: none;
        border-left: solid 1px #000;
      }

      #container > j-for-scope:nth-last-of-type(-n+19) {
        border: none;
        border-top: solid 1px #000;
      }

      #container > j-for-scope:last-of-type {
        border: none;
      }

      slot::slotted(*) {
        z-index: 1000;
      }
    `,
    html`
      <j-for bind="cells" key="slot" id="container">
        <template>
          <j-bind props="name:each.value.slot" class="cell">
            <slot></slot>
          </j-bind>

          <j-bind props="id:each.value.slot" class="cell-label">
            <button></button>
          </j-bind>
        </template>
      </j-for>
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
  @bind()
  accessor rows = 19;

  @attr()
  @bind()
  accessor cols = 19;

  @bind({
    compute(self) {
      return Array.from({ length: self.rows * self.cols }, (_, i) => {
        const row = Math.floor(i / self.cols);
        const col = i % self.cols;
    
        return {
          row,
          col,
          slot: `${COLUMN_LABELS[col]}${self.rows - row}`,
        }
      })
    }
  })
  accessor cells: Cell[] = [];

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
  previousKey: string | null = null;
  currentKey: string | null = null;

  #debug = inject(Debug);
  #game = inject(GoGame);
  #internals = this.attachInternals();

  constructor() {
    super();

    this.#internals.setFormValue(this.currentKey);
  }

  connectedCallback() {
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

  // #createSlot(row: number, column: number) {
  //   const slot = document.createElement("slot");
  //   slot.name = `${this.columnLabels[column]}${this.rows - row}`;

  //   this.spaces.set(slot.name, null);

  //   const spacing = Math.floor(this.rows / 3);
  //   const start = Math.floor(this.rows / 4) - 1;
  //   const spaces = [start, start + spacing, start + spacing * 2];

  //   // Define which spaces should be decorated as a starpoint
  //   if (spaces.includes(row) && spaces.includes(column)) {
  //     slot.classList.add("starpoint");
  //   }

  //   const btn = document.createElement("button");
  //   btn.title = slot.name;
  //   btn.id = slot.name;

  //   slot.append(btn);

  //   return slot;
  // }
}
