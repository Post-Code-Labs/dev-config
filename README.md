# @post-code-labs/dev-config

Single source of truth for the **importable baseline configs** shared across
consuming repos: linting, formatting, type-check, and Python tooling.

Everything here is a **required, live import**: a consumer `extends`/`import`s
these out of `node_modules` (pinned to a tag), so a change here ripples to every
consumer on the next install.

Published as-is for our own consumption under the Apache-2.0 license. Not seeking
external contributions or support — Issues are off, and PRs aren't monitored.

## What qualifies to live here

An artifact belongs in this repo only if **all** of the following hold. If any
fails, it stays in the consuming repo (or, for one-time scaffold, a separate
template repo) — not here.

1. **Consumed by reference, not by copy.** It is `extends`/`import`-ed from the
   package, so a single edit propagates on install. If the only way to adopt it
   is to copy a file, it does not qualify.
2. **Universally correct.** The rule is right for *every* consumer, not one
   project's local taste. Anything that needs per-repo divergence to be correct
   is exposed as an overridable base — never hard-coded here.
3. **Behavior-defining and mechanically checkable.** It sets lint / format /
   type / CI behavior whose effect can be verified by a tool, so "in sync" is
   provable rather than aspirational.
4. **A stable, versioned contract.** It has a clear import path and ships under
   a tag; consumers opt into changes by bumping the pin.

Corollaries: the inputs stay **minimal and composable** (a small base plus a
documented override seam, not a project's full config), and the outputs stay
**predictable** (every change's blast radius is understood and called out).

## What's here

| Path | What it is | How a repo consumes it |
| --- | --- | --- |
| `prettier/index.json` | Canonical Prettier config | `"prettier": "@post-code-labs/dev-config/prettier"` in `package.json` |
| `typescript/tsconfig.base.json` | Base strict TS config (Node) | `"extends": "@post-code-labs/dev-config/typescript/tsconfig.base.json"` |
| `typescript/tsconfig.react.json` | Base + DOM/JSX for Next.js apps | `extends` as above |
| `eslint/base.mjs` | Flat ESLint preset (strict type-checked + stylistic + import + complexity) | `import { baseConfig } from '@post-code-labs/dev-config/eslint/base'` |
| `eslint/react.mjs` | `baseConfig` + `eslint-config-next` | `import { reactConfig } from '@post-code-labs/dev-config/eslint/react'` |
| `python/ruff.toml` | Shared ruff lint/format baseline | `extend = ".../ruff.toml"` |
| `python/mypy.ini` | Shared mypy strict baseline | `extend` / merge keys |
| `versions.json` | Pinned toolchain versions | reference when wiring `devDependencies` |

## Locked decisions (2026-06)

- **Prettier:** `semi: true, singleQuote: true, trailingComma: all, printWidth: 100, tabWidth: 2`.
- **Package manager:** pnpm everywhere.
- **TypeScript target:** `ES2024`.
- **ESLint base:** typescript-eslint `strictTypeChecked` + `stylisticTypeChecked`
  + import ordering + complexity guardrails. No mandatory JSDoc.
- **Versioning:** CalVer git tags `YYYY.MM` (e.g. `2026.06`).

## Keeping quality high

Because the outputs are other repos' lint/format/type/CI behavior, the standard
is correctness and predictability, upheld by process:

- **Identical inputs → identical outputs.** Pin the exact toolchain the shipped
  configs depend on in `versions.json`; consumers align to it. A config only
  behaves the same everywhere if the tool version behind it is the same.
- **Breaking by default.** Treat every edit as breaking until shown otherwise.
  Prefer additive change; explicitly call out anything that alters lint, format,
  type, or CI behavior, and what a consumer must do to adopt it.
- **Versioned adoption.** Ship under a tag; consumers opt in by bumping the pin
  (see Versioning). Never expect a consumer to track a moving branch.
- **Composition over forking.** When a consumer legitimately differs, extend the
  base through a documented override seam rather than copying or special-casing
  it here. One base, many overrides — not many bases.
- **Resolvable surface.** Keep `package.json` `exports`/`files` in step with the
  files so every advertised import path actually resolves; validate that configs
  parse and presets load before tagging a release.

## Versioning

Releases are **CalVer git tags** in the form `YYYY.MM` (e.g. `2026.06`). A
second release within the same month appends an incrementing suffix:
`2026.06.1`, `2026.06.2`, …

**Pin consumers to a tag, never the default branch.** Installing
`github:Post-Code-Labs/dev-config` untagged tracks `main`, so a single edit here
would silently change linting/formatting/type-check across every consumer on the
next install. Bump each consumer's pin deliberately. (The package is consumed by
git tag, so the `package.json` `version` field is not the contract — the tag is.)

## Consuming repo install

```jsonc
// package.json
{
  "devDependencies": {
    "@post-code-labs/dev-config": "github:Post-Code-Labs/dev-config#2026.06.1"
  }
}
```

Then wire each config by reference:

```jsonc
// package.json
{ "prettier": "@post-code-labs/dev-config/prettier" }
```

```jsonc
// tsconfig.json
{ "extends": "@post-code-labs/dev-config/typescript/tsconfig.base.json" }
```

```js
// eslint.config.mjs
import { globalIgnores } from 'eslint/config';
import { baseConfig } from '@post-code-labs/dev-config/eslint/base';

export default [
  globalIgnores(['dist/**', 'coverage/**', '.next/**', 'worktrees/**']),
  ...baseConfig({ tsconfigRootDir: import.meta.dirname }),
];
```

See each file's README/header for specifics (e.g. `prettier/README.md` for the
Tailwind plugin override, `typescript/README.md` for per-package extends).
