const regex = /[A-Z]\[[a-z]{2}\]/gm;

const alpha = Array.from(Array(26)).map((e, i) => i + 65);
const alphabet = alpha.map((x) => String.fromCharCode(x));
const columnNames = [
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

export function parseSGF(value) {
  return value
    .split("\n")
    .filter((line) => !!line.match(regex))
    .map((line) => {
      const parsed = line.split("");

      const column =
        columnNames[alphabet.indexOf(parsed[parsed.length - 3].toUpperCase())];

      const row =
        19 - alphabet.indexOf(parsed[parsed.length - 2].toUpperCase());

      return column + row.toString();
    });
}
