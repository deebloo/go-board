import { minifyHTMLLiterals } from "minify-html-literals";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    plugins: [
      {
        name: "minify-html-literals",
        transform: (code) => minifyHTMLLiterals(code)?.code,
      },
    ],
  },
});
