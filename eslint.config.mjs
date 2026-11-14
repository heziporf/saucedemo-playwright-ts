import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import playwright from 'eslint-plugin-playwright';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores([
    'node_modules/',
    'playwright-report/',
    'test-results/',
    'allure-results/',
    'allure-report/',
  ]),
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    },
  },
  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    extends: [playwright.configs['flat/recommended']],
    rules: {
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-force-option': 'error',
      'playwright/no-nth-methods': 'error',
      'playwright/expect-expect': ['error', { assertFunctionPatterns: ['^assert[A-Z]'] }],
      'playwright/valid-test-tags': 'off',
    },
  },
  {
    files: ['tests/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/fixtures/index',
              importNames: ['expect'],
              message: 'Checks belong in the assert methods of page objects and API clients.',
            },
            {
              name: '@playwright/test',
              importNames: ['expect'],
              message: 'Checks belong in the assert methods of page objects and API clients.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
  },
);
