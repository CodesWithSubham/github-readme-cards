import eslint from "@eslint/js";
import globals from "globals";
import { defineConfig, globalIgnores } from "eslint/config";

import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  eslint.configs.recommended,

  ...nextVitals,
  ...nextTs,

  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },

      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      "no-console": ["warn", { allow: ["info", "warn", "error"] }],

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],

      "@typescript-eslint/no-explicit-any": "warn",

      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],
    },
  },

  globalIgnores([".next/**", "out/**", "dist/**", "build/**", "node_modules/**", "next-env.d.ts"]),
  {
    files: ["*.config.{js,mjs,cjs,ts}", ".*rc.{js,mjs,cjs,ts}"],

    languageOptions: {
      parserOptions: {
        projectService: false,
      },
    },
  },
]);
