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

// eslint-config-next bundles its OWN copies of the `@typescript-eslint` and `import` plugins
// (its `next/typescript` config registers the former, its `next` config the latter). ESLint
// flat config forbids defining one plugin name with two different plugin objects across
// configs that match the same files, and `baseConfig` already registers both — so spreading
// the two arrays as-is throws `Cannot redefine plugin "@typescript-eslint"`.
//
// `baseConfig` must stay the single definer of both: its type-aware `strictTypeChecked` rules
// are bound to the consumer's typescript-eslint, not next's vendored copy. So we strip next's
// duplicate plugin *definitions* and let `baseConfig` own them. next's
// react/react-hooks/jsx-a11y/@next/next plugins and all their rules are kept untouched; next's
// `import/*` rules and resolver settings remain and resolve against `baseConfig`'s import
// plugin (flat config merges every matching config, then resolves rule references against the
// single plugin namespace). Matched by plugin *presence*, not config name, to stay resilient
// to eslint-config-next reshuffling its internals.
const BASE_OWNED_PLUGINS = ['@typescript-eslint', 'import'];

/**
 * Strip the `@typescript-eslint`/`import` plugin *definitions* from an
 * eslint-config-next config array so `baseConfig` can be their single definer.
 * Exported for the smoke test; consumers should use {@link reactConfig}.
 * @param {import('eslint').Linter.Config[]} configs
 * @returns {import('eslint').Linter.Config[]}
 */
export function withoutBaseOwnedPlugins(configs) {
  return configs.flatMap((config) => {
    if (!config.plugins) return [config];
    const owned = BASE_OWNED_PLUGINS.filter((name) => name in config.plugins);
    if (owned.length === 0) return [config];
    const plugins = { ...config.plugins };
    for (const name of owned) delete plugins[name];
    // A config left with no plugins and no rules only carried a base-owned plugin plus a parser
    // (next's `next/typescript`, redundant with strictTypeChecked). Drop it so it can't shadow
    // baseConfig's parser/projectService settings; settings-only configs are kept above.
    const hasRules = config.rules && Object.keys(config.rules).length > 0;
    if (Object.keys(plugins).length === 0 && !hasRules) return [];
    return [{ ...config, plugins }];
  });
}

/**
 * Build the shared React/Next flat-config array.
 * @param {{ tsconfigRootDir?: string }} [options]
 * @returns {import('eslint').Linter.Config[]}
 */
export function reactConfig(options = {}) {
  return [...withoutBaseOwnedPlugins(nextVitals), ...baseConfig(options)];
}

export default reactConfig;
