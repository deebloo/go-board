import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import { minifyHTMLLiterals } from "minify-html-literals";

export default {
  input: "target/define.js",
  output: {
    file: "public/go-board.min.js",
    format: "iife",
  },
  plugins: [
    nodeResolve(),
    {
      name: "minify-html-literals",
      transform: (code) => minifyHTMLLiterals(code)?.code,
    },
    terser(),
  ],
};
