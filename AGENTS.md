# dev-config — coding-agent instructions

This repo is the shared, **importable** baseline configs consumed by other
`builtbydoug` repos. It has no application code; everything here is config that
other repos `extends`/`import` (Prettier, tsconfig, ESLint, ruff/mypy) plus one
reusable CI workflow. See `README.md` for the consumption model and the locked
decisions.

## Scope

- In scope: **required, live imports** — configs repos depend on and that ripple
  to every consumer on install.
- Out of scope: one-time scaffold files (AGENTS.md content, CODEOWNERS,
  dependabot, lefthook, PR templates). Those belong in a future `repo-template`,
  not here. Don't reintroduce them.

## Working rules

- Changes here ripple to every consuming repo. Treat edits as breaking by
  default: prefer additive changes, and call out anything that alters lint,
  format, type-check, or CI behavior.
- Consumers pin to a **git tag**, never `main`. After a meaningful change, bump
  `package.json` `version`, tag a release, and note what downstream repos must do
  to adopt it.
- Keep `package.json` `exports`/`files` in step with the actual config files so
  every importable path resolves.

## Conventions

- The repo's own instructions live in `AGENTS.md` with a `CLAUDE.md` symlink.
- The reusable workflow lives under `.github/workflows/` (required for
  `workflow_call`) and is `workflow_call`-only, so it never self-triggers.
- Pin every `uses:` in the reusable workflow to a full commit SHA with a
  `# vX.Y.Z` comment.
- Locked toolchain decisions and pinned versions live in `README.md` and
  `versions.json` — keep them in sync with the actual config files.

## Git workflow

- Never push to `main`. Work on a branch and open a draft PR.
