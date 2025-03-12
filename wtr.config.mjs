export default {
  port: 8000,
  nodeResolve: {
    exportConditions: ["production"],
  },
  files: "target/**/*.spec.js",
};
