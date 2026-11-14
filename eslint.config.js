import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist', 'dev-dist', 'android', 'releases', 'node_modules']),
  {
    files: ['**/*.{ts,tsx,js}'],
    extends: [js.configs.recommended, tseslint.configs.recommended, prettier],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { 'simple-import-sort': simpleImportSort, '@stylistic': stylistic },
    rules: {
      complexity: ['error', 10],
      'max-depth': ['error', 3],
      // A blank line around every function, class and multi-line statement, so blocks don't run together.
      '@stylistic/padding-line-between-statements': [
        'error',
        {
          blankLine: 'always',
          prev: [
            'function',
            'class',
            'multiline-const',
            'multiline-let',
            'multiline-block-like',
            'multiline-expression',
          ],
          next: '*',
        },
        {
          blankLine: 'always',
          prev: '*',
          next: [
            'function',
            'class',
            'multiline-const',
            'multiline-let',
            'multiline-block-like',
            'multiline-expression',
          ],
        },
      ],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
  },
]);
