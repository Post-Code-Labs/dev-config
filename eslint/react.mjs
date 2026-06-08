// Shared flat ESLint preset for Next.js / React apps: `eslint-config-next`
// (core-web-vitals) layered before the shared base. Prettier-conflicting
// stylistic rules are still disabled last by `baseConfig` (it ends with
// eslint-config-prettier).
//
// Usage (consumer eslint.config.mjs in a Next.js app):
//
//   import { globalIgnores } from 'eslint/config';
//   import { reactConfig } from '@post-code-labs/dev-config/eslint/react';
//
//   export default [
//     globalIgnores(['.next/**', 'dist/**', 'out/**', 'worktrees/**', 'next-env.d.ts']),
//     ...reactConfig({ tsconfigRootDir: import.meta.dirname }),
//   ];
//
// `react.version` is pinned (default '19.0', override via `reactConfig({ reactVersion })`):
// eslint-config-next's 'detect' crashes eslint-plugin-react on ESLint 10.

import nextVitals from 'eslint-config-next/core-web-vitals';

import { baseConfig } from './base.mjs';

// eslint-config-next also registers @typescript-eslint and import, but flat config forbids two
// configs defining one plugin name with different objects ("Cannot redefine plugin"). Strip next's
// copies (matched by presence, not config name) so baseConfig is the sole definer; next's
// react/react-hooks/jsx-a11y/@next/next plugins and import rules still apply.
const BASE_OWNED_PLUGINS = ['@typescript-eslint', 'import'];

/** Strip the base-owned plugin definitions from an eslint-config-next array. Exported for tests. */
export function withoutBaseOwnedPlugins(configs) {
  return configs.flatMap((config) => {
    if (!config.plugins) return [config];
    const owned = BASE_OWNED_PLUGINS.filter((name) => name in config.plugins);
    if (owned.length === 0) return [config];
    const plugins = { ...config.plugins };
    for (const name of owned) delete plugins[name];
    // Left with only a base-owned plugin + parser (next/typescript) → drop; baseConfig owns parsing.
    const hasRules = config.rules && Object.keys(config.rules).length > 0;
    if (Object.keys(plugins).length === 0 && !hasRules) return [];
    return [{ ...config, plugins }];
  });
}

/**
 * Build the shared React/Next flat-config array.
 * @param {{ tsconfigRootDir?: string, reactVersion?: string }} [options]
 * @returns {import('eslint').Linter.Config[]}
 */
export function reactConfig({ reactVersion = '19.0', ...options } = {}) {
  return [
    ...withoutBaseOwnedPlugins(nextVitals),
    // Override next's `react.version: 'detect'` (see header); must follow next's configs to win.
    { name: 'dev-config/react-version', settings: { react: { version: reactVersion } } },
    ...baseConfig(options),
  ];
}

export default reactConfig;
