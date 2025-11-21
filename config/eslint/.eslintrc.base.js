
module.exports = {
  env: { browser: true, node: true },
  parser: "@typescript-eslint/parser",
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  rules: { "@typescript-eslint/no-unused-vars": "error" }
};
