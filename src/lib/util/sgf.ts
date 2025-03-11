import type { StoneColor } from "../elements/stone.element.js";

const alphabet = Array(26)
  .fill(null)
  .map((_, i) => String.fromCharCode(i + 65));

const regex = /([A-Z])\[([a-z]{2})\]/;

export interface Move {
  color: StoneColor;
  space: string;
}

export function parseSGF(
  value: string,
  columns: string[],
  rows: number,
): Move[] {
  const moves: Move[] = [];
  const lines = value.split("\n");

  for (const line of lines) {
    const match = regex.exec(line.trim());

    if (match) {
      const coords = match[2].split("");
      const column = columns[alphabet.indexOf(coords[0].toUpperCase())];
      const row = rows - alphabet.indexOf(coords[1].toUpperCase());

      moves.push({
        color: match[1] === "B" ? "black" : "white",
        space: column + row.toString(),
      });
    }
  }

  return moves;
}
