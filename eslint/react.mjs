// Shared flat ESLint preset for Next.js / React apps: `eslint-config-next`
// (core-web-vitals) layered before the shared base. Prettier-conflicting
// stylistic rules are still disabled last by `baseConfig` (it ends with
// eslint-config-prettier).
//
// Usage (consumer eslint.config.mjs in a Next.js app):
//
//   import { globalIgnores } from 'eslint/config';
//   import { reactConfig } from '@builtbydoug/dev-config/eslint/react';
//
//   export default [
//     globalIgnores(['.next/**', 'dist/**', 'out/**', 'worktrees/**', 'next-env.d.ts']),
//     ...reactConfig({ tsconfigRootDir: import.meta.dirname }),
//   ];

import nextVitals from 'eslint-config-next/core-web-vitals';

import { baseConfig } from './base.mjs';

/**
 * Build the shared React/Next flat-config array.
 * @param {{ tsconfigRootDir?: string }} [options]
 * @returns {import('eslint').Linter.Config[]}
 */
export function reactConfig(options = {}) {
  return [...nextVitals, ...baseConfig(options)];
}

export default reactConfig;
