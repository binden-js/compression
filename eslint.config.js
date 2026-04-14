import config from "@binden/eslint-config-ts";
export default [
  ...config,
  {
    languageOptions: {
      parserOptions: {
        project: "tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  { ignores: ["dist/*", "docs/*", "coverage", "eslint.config.js"] },
];
