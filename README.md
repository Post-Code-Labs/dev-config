# @builtbydoug/dev-config

Single source of truth for the **importable baseline configs** shared across the
`builtbydoug` repos (`examprep`, `personal-property`, `postcode`, …): linting,
formatting, type-check, and Python tooling — plus one reusable CI workflow.

Everything here is a **required, live import**: repos `extends`/`import` these
out of `node_modules` (pinned to a tag), so a change here ripples to every
consumer on the next install. This repo deliberately holds **no** one-time
scaffold files (AGENTS.md content, CODEOWNERS, dependabot, lefthook, PR
templates). Those belong in a future `repo-template` and are out of scope here.

## What's here

| Path | What it is | How a repo consumes it |
| --- | --- | --- |
| `prettier/index.json` | Canonical Prettier config | `"prettier": "@builtbydoug/dev-config/prettier"` in `package.json` |
| `typescript/tsconfig.base.json` | Base strict TS config (Node) | `"extends": "@builtbydoug/dev-config/typescript/tsconfig.base.json"` |
| `typescript/tsconfig.react.json` | Base + DOM/JSX for Next.js apps | `extends` as above |
| `eslint/base.mjs` | Flat ESLint preset (strict type-checked + stylistic + sonarjs + import + complexity) | `import { baseConfig } from '@builtbydoug/dev-config/eslint/base'` |
| `eslint/react.mjs` | `baseConfig` + `eslint-config-next` | `import { reactConfig } from '@builtbydoug/dev-config/eslint/react'` |
| `python/ruff.toml` | Shared ruff lint/format baseline | `extend = ".../ruff.toml"` |
| `python/mypy.ini` | Shared mypy strict baseline | `extend` / merge keys |
| `.github/workflows/reusable-node-quality.yml` | Reusable CI (`workflow_call`) | `uses: builtbydoug/dev-config/.github/workflows/reusable-node-quality.yml@<tag>` |
| `versions.json` | Pinned toolchain versions | reference when wiring `devDependencies` |

## Locked decisions (2026-06)

- **Prettier:** `semi: true, singleQuote: true, trailingComma: all, printWidth: 100, tabWidth: 2`.
- **Package manager:** pnpm everywhere (examprep migrates off npm).
- **TypeScript target:** `ES2024`.
- **ESLint base:** typescript-eslint `strictTypeChecked` + `stylisticTypeChecked`
  + `sonarjs` + import ordering + complexity guardrails. No mandatory JSDoc.

## Versioning

**Pin consumers to a git tag, never the default branch.** Installing
`github:builtbydoug/dev-config` untagged tracks `main`, so a single edit here
would silently change linting/formatting/CI across every repo on the next
install. Tag releases (`v0.1.0`, …) and bump each repo deliberately.

## Consuming repo install

```jsonc
// package.json
{
  "devDependencies": {
    "@builtbydoug/dev-config": "github:builtbydoug/dev-config#v0.1.0"
  }
}
```

Then wire each config by reference:

```jsonc
// package.json
{ "prettier": "@builtbydoug/dev-config/prettier" }
```

```jsonc
// tsconfig.json
{ "extends": "@builtbydoug/dev-config/typescript/tsconfig.base.json" }
```

```js
// eslint.config.mjs
import { globalIgnores } from 'eslint/config';
import { baseConfig } from '@builtbydoug/dev-config/eslint/base';

export default [
  globalIgnores(['dist/**', 'coverage/**', '.next/**', 'worktrees/**']),
  ...baseConfig({ tsconfigRootDir: import.meta.dirname }),
];
```

```yaml
# .github/workflows/ci.yml
jobs:
  quality:
    uses: builtbydoug/dev-config/.github/workflows/reusable-node-quality.yml@v0.1.0
    with:
      node-version: '24'
```

See each file's README/header for specifics (e.g. `prettier/README.md` for the
Tailwind plugin override, `typescript/README.md` for per-package extends).
