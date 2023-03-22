import terser from "@rollup/plugin-terser";
import { minifyHTMLLiterals } from "minify-html-literals";

export default {
  input: "target/register.js",
  output: {
    file: "target/bundle/go-board.min.js",
    format: "iife",
  },
  plugins: [
    {
      name: "minify-html-literals",
      transform: (code) => minifyHTMLLiterals(code)?.code,
    },
    terser(),
  ],
};
