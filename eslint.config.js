import config from "eslint-config-binden-ts";
export default [
  ...config,
  { languageOptions: { parserOptions: { project: "tsconfig.json" } } },
];
