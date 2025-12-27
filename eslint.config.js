import stylistic from '@stylistic/eslint-plugin';
import gitignore from 'eslint-config-flat-gitignore';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';
import { defineConfig } from 'vite';

export default defineConfig(
    gitignore({
        files: ['.gitignore', '.prettierignore']
    }),
    {
        plugins: {
            '@stylistic': stylistic
        }
    },
    stylistic.configs.customize({
        // the following options are the default values
        indent: 2,
        indentType: 'space',
        quotes: 'single',
        semi: false,
        jsx: true
        // ...
    }),
    ...ts.configs.recommended,
    ...svelte.configs['flat/recommended'],
    prettier,
    ...svelte.configs['flat/prettier'],
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node
            }
        }
    },
    {
        rules: {
            '@stylistic/indent': ['error', 2],
            '@stylistic/semi': ['error', 'always']
        }
    },
    {
        files: ['**/*.svelte'],
        languageOptions: {
            parserOptions: {
                parser: ts.parser
            }
        }
    }
);
