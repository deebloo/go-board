import { attr, observable, observe } from "@joist/observable";
import { query } from "@joist/query";
import { GoBoardElement } from "./board.element";

const regex = /[A-Z]\[[a-z]{2}\]/gm;
const alpha = Array.from(Array(26)).map((_, i) => i + 65);
const alphabet = alpha.map((x) => String.fromCharCode(x));

@observable
export class SGFViewerElement extends HTMLElement {
  @observe @attr path?: string;

  @observe @attr ogsid?: string;

  @observe @attr({ read: Number }) delay = 100;

  @query("go-board,#board") board!: GoBoardElement;

  async connectedCallback() {
    const path = this.ogsid
      ? `https://online-go.com/api/v1/games/${this.ogsid}/sgf`
      : this.path;

    console.log("###", this.ogsid);

    const raw = await fetch(path || "").then((res) => res.text());

    const data = this.parseSGF(raw);
    let timeout = 0;

    data.forEach((move) => {
      timeout = timeout + this.delay;

      const button = this.board.shadowRoot!.querySelector<HTMLButtonElement>(
        `button#${move}`
      )!;

      if (this.delay > 0) {
        setTimeout(() => {
          button.click();
        }, timeout);
      } else {
        button.click();
      }
    });
  }

  parseSGF(value: string) {
    return value
      .split("\n")
      .filter((line) => !!line.match(regex))
      .map((line) => {
        const parsed = line.split("");

        console.log(parsed);

        const column =
          this.board.columnLabels[
            alphabet.indexOf(parsed[parsed.length - 3].toUpperCase())
          ];

        const row =
          this.board.rows -
          alphabet.indexOf(parsed[parsed.length - 2].toUpperCase());

        return column + row.toString();
      });
  }
}
