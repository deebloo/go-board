import minifyHTML from "rollup-plugin-minify-html-literals";

export default {
  build: {
    lib: {
      entry: "src/lib.ts",
      name: "Go",
      fileName: (format) => `go.${format}.js`,
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      plugins: [minifyHTML.default()],
    },
  },
};
