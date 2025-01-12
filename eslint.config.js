import eslintPluginReact from "eslint-plugin-react";
import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";
import typescriptEslintParser from "@typescript-eslint/parser";

export default [
  {
    ignores: ["node_modules", "dist"], // Ignore unnecessary paths
  },
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"], // Target JavaScript and TypeScript files
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: typescriptEslintParser, // Specify the TypeScript parser
    },
    plugins: {
      react: eslintPluginReact,
      "@typescript-eslint": typescriptEslintPlugin,
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "warn",
      "react/react-in-jsx-scope": "off",
    },
  },
];
