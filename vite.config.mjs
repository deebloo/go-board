import minifyHTML from "rollup-plugin-minify-html-literals";

import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "bundled",
    lib: {
      entry: "src/register.ts",
      name: "Go",
      fileName: (format) => `go.${format}.js`,
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      plugins: [minifyHTML.default()],
    },
  },
});
