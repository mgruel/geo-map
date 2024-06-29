import stylisticjs from "@stylistic/eslint-plugin-js";
import svelte from "eslint-plugin-svelte";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: [
        "**/node_modules",
        "**/dist",
        "**/public",
        "**/rollup.config.js",
        "**/.github",
    ],
}, ...compat.extends("eslint:recommended", "plugin:svelte/recommended"), {
    plugins: {
        "@stylistic/js": stylisticjs,
        svelte,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
        },

        ecmaVersion: 2022,
        sourceType: "module",
    },

    rules: {
        "@stylistic/js/indent": ["error", 4],
        "linebreak-style": ["error", "unix"],
        quotes: ["error", "double"],
        semi: ["error", "always"],
    },
}];