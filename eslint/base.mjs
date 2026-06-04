// Shared flat ESLint preset for builtbydoug TypeScript repos.
//
// Philosophy (locked 2026-06): typescript-eslint `strictTypeChecked` +
// `stylisticTypeChecked` + sonarjs + import ordering + complexity guardrails.
// No mandatory JSDoc. Stylistic rules that fight Prettier are disabled last via
// `eslint-config-prettier`.
//
// Type-aware rules need a TS program. We use `parserOptions.projectService` so
// there is no hard-coded tsconfig path to keep in sync; pass `tsconfigRootDir`
// from the consumer (`import.meta.dirname`) so the service roots correctly.
//
// Usage (consumer eslint.config.mjs):
//
//   import { globalIgnores } from 'eslint/config';
//   import { baseConfig } from '@builtbydoug/dev-config/eslint/base';
//
//   export default [
//     globalIgnores(['dist/**', 'coverage/**', '.next/**', 'worktrees/**']),
//     ...baseConfig({ tsconfigRootDir: import.meta.dirname }),
//   ];

import prettierConfig from 'eslint-config-prettier/flat';
import importPlugin from 'eslint-plugin-import';
import sonarjs from 'eslint-plugin-sonarjs';
import tseslint from 'typescript-eslint';

// Import hygiene + deterministic ordering (builtin/external, then internal).
export const importRules = {
  'import/first': 'error',
  'import/newline-after-import': ['error', { count: 1 }],
  'import/no-self-import': 'error',
  'import/no-useless-path-segments': 'error',
  'import/order': [
    'error',
    {
      groups: [
        ['builtin', 'external'],
        ['internal', 'parent', 'sibling', 'index', 'object'],
      ],
      pathGroups: [
        { pattern: 'next/**', group: 'external', position: 'before' },
        { pattern: '@/**', group: 'internal', position: 'after' },
      ],
      pathGroupsExcludedImportTypes: ['builtin', 'type'],
      'newlines-between': 'always',
      alphabetize: { order: 'asc', caseInsensitive: true },
    },
  ],
};

// Project-wide TS preferences layered on top of strictTypeChecked.
export const tsRules = {
  '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
  '@typescript-eslint/no-import-type-side-effects': 'error',
  '@typescript-eslint/no-unused-vars': [
    'error',
    { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
  ],
  'prefer-const': 'error',
};

// Complexity & size guardrails (catch the "200-line nested mess" failure mode).
// Conservative shared ceilings; a repo may tighten or, where a documented
// outlier exists, loosen a single rule locally.
export const complexityRules = {
  complexity: ['error', 15],
  'sonarjs/cognitive-complexity': ['error', 15],
  'max-depth': ['error', 4],
  'max-params': ['error', 4],
  'max-nested-callbacks': ['error', 3],
  'max-lines-per-function': ['error', { max: 200, skipBlankLines: true, skipComments: true }],
};

// Test files: keep complexity gates but relax size/nesting (long table-driven
// specs, big fixtures) and the type-aware "unsafe" rules that fire on mocks.
const testRelaxations = {
  'max-nested-callbacks': ['error', 4],
  'max-lines-per-function': 'off',
  'sonarjs/no-duplicate-string': 'off',
  '@typescript-eslint/no-unsafe-assignment': 'off',
  '@typescript-eslint/no-unsafe-argument': 'off',
  '@typescript-eslint/no-unsafe-member-access': 'off',
  '@typescript-eslint/no-unsafe-call': 'off',
  '@typescript-eslint/no-non-null-assertion': 'off',
};

/**
 * Build the shared flat-config array.
 * @param {{ tsconfigRootDir?: string }} [options]
 * @returns {import('eslint').Linter.Config[]}
 */
export function baseConfig({ tsconfigRootDir } = {}) {
  return [
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    sonarjs.configs.recommended,
    {
      files: ['**/*.{ts,tsx}'],
      plugins: { import: importPlugin },
      languageOptions: {
        parserOptions: {
          projectService: true,
          ...(tsconfigRootDir ? { tsconfigRootDir } : {}),
        },
      },
      rules: {
        ...importRules,
        ...tsRules,
        ...complexityRules,
      },
    },
    {
      files: [
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/__tests__/**/*.{ts,tsx}',
        'tests/**/*.{ts,tsx}',
      ],
      rules: testRelaxations,
    },
    // Must come last: turns off stylistic rules that conflict with Prettier.
    prettierConfig,
  ];
}

export default baseConfig;
