# @builtbydoug/dev-config

Single source of truth for baseline tooling across the `builtbydoug` repos
(`examprep`, `personal-property`, `postcode`, …). It centralises linting,
formatting, type-check, Python tooling, git hooks, GitHub Actions, and the
shared `AGENTS.md` constitution so every repo inherits the same rules.

## What's here

| Path | What it is | How a repo consumes it |
| --- | --- | --- |
| `prettier/index.json` | Canonical Prettier config | `"prettier": "@builtbydoug/dev-config/prettier"` in `package.json` |
| `typescript/tsconfig.base.json` | Base strict TS config (Node) | `"extends": "@builtbydoug/dev-config/typescript/tsconfig.base.json"` |
| `typescript/tsconfig.react.json` | Base + DOM/JSX for Next.js apps | `extends` as above |
| `eslint/base.mjs` | Flat ESLint preset (strict type-checked + stylistic + sonarjs + import + complexity) | `import { baseConfig } from '@builtbydoug/dev-config/eslint/base'` |
| `eslint/react.mjs` | `baseConfig` + `eslint-config-next` | `import { reactConfig } from '@builtbydoug/dev-config/eslint/react'` |
| `python/ruff.toml` | Shared ruff lint/format baseline | `extend = ".../ruff.toml"` (or copy via sync) |
| `python/mypy.ini` | Shared mypy strict baseline | copy via sync |
| `lefthook/lefthook.base.yml` | Shared pre-commit / pre-push hooks | copy via sync |
| `github/workflows/reusable-node-quality.yml` | Reusable CI (`workflow_call`) | `uses: builtbydoug/dev-config/.github/workflows/...@<tag>` |
| `github/workflows/pr-title.yml`, `workflow-lint.yml` | CI templates | copy via sync |
| `github/dependabot-*.yml`, `github/CODEOWNERS` | Policy files | copy via sync |
| `scripts/check-action-pins.sh` | Enforces SHA-pinned actions | copy via sync |
| `scripts/sync-config.sh` | Copies the non-importable files into a repo | run from a consumer repo |
| `agents/*.md` | Shared `AGENTS.md` constitution blocks | paste between markers, refresh via sync |
| `versions.json` | Pinned toolchain versions | reference when wiring `devDependencies` |

## Two ways config reaches a repo

1. **Importable** — `extends`/`import` resolves the file out of
   `node_modules/@builtbydoug/dev-config`: Prettier, base tsconfig, ESLint
   presets, ruff `extend`. Change once here, repos pick it up on install.
2. **Copyable** — GitHub Actions workflow files, `dependabot.yml`,
   `CODEOWNERS`, `lefthook.yml`, `.nvmrc`, and the `AGENTS.md` blocks **cannot
   be imported** — they must physically exist in each repo. CI uses a reusable
   `workflow_call` where possible; everything else is copied by
   `scripts/sync-config.sh` and refreshed deliberately.

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

Then wire Prettier / tsconfig / ESLint as in the table above, and run
`pnpm dlx @builtbydoug/dev-config sync` (or `scripts/sync-config.sh`) to drop in
the copyable files. See each file's header comment for specifics.
