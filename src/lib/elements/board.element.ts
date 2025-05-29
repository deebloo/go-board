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
  isStarPoint: boolean;
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

      .star-point {
        content: "";
        height: 8px;
        width: 8px;
        position: absolute;
        bottom: 0;
        right: 0;
        background-color: #000;
        border-radius: 50%;
        transform: translate(50%, 50%);
      }

      #container > j-for-scope slot {
        display: block;
        height: 100%;
        width: 100%;
      }

      #container > j-for-scope slot::slotted(*) {
        width: 98%;
        height: 98%;
        position: absolute;
        transform: translate(-50%, -50%);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      #container > j-for-scope button {
        width: 100%;
        height: 100%;
        position: absolute;
        padding: 0;
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
        opacity: 0.5;
      }

      :host([turn="black"]) #container > j-for-scope button {
        background-color: #000;
      }

      #container > j-for-scope:nth-of-type(19n) {
        border: none;
        border-left: solid 1px #000;
      }

      #container > j-for-scope:nth-last-of-type(-n + 19) {
        border: none;
        border-top: solid 1px #000;
      }

      #container > j-for-scope:last-of-type {
        border: none;
      }

      :host(:not([disablelastmarker])) ::slotted(go-stone:last-child)::after {
        content: "";
        height: 50%;
        width: 50%;
        border-radius: 50%;
        border: solid 2px;
        position: absolute;
      }
    `,
    html`
      <j-for bind="cells" key="slot" id="container">
        <template>
          <j-bind props="name:each.value.slot">
            <slot></slot>
          </j-bind>

          <j-bind props="id:each.value.slot">
            <button></button>
          </j-bind>

          <j-if bind="each.value.isStarPoint">
            <template>
              <div class="star-point"></div>
            </template>
          </j-if>
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
  
  #starRows = [3, 9, 15];
  #starCols = [3, 9, 15];

  @bind({
    compute(self) {
      const size = self.cols;
    
      return self.#starRows.flatMap(row => 
        self.#starCols.map(col => (row - 1) * size + (col - 1))
      );
    },
  })
  accessor starPoints: number[] = [];

  @bind({
    compute(self) {
      return Array.from({ length: self.rows * self.cols }, (_, i) => {
        const row = Math.floor(i / self.cols);
        const col = i % self.cols;
    
        return {
          row,
          col,
          slot: `${COLUMN_LABELS[col]}${self.rows - row}`,
          isStarPoint: self.starPoints.includes(i)
        };
      });
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

    for (const cell of this.cells) {
      const stone = this.spaces.get(cell.slot);

      if (stone) {
        key += stone.color[0].toUpperCase() + cell.slot;
      } else {
        key += "*";
      }
    }

    return key;
  }

  reset() {
    this.innerHTML = "";
    this.currentKey = this.createKey();
    this.previousKey = "";
    this.turn = "black";
  }
}
