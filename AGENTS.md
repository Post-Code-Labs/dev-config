# dev-config — coding-agent instructions

This repo is the shared baseline tooling consumed by other `builtbydoug` repos.
It has no application code; everything here is config that other repos import or
copy. See `README.md` for the consumption model and the locked decisions.

## Working rules

- Changes here ripple to every consuming repo. Treat edits as breaking by
  default: prefer additive changes, and call out anything that alters lint,
  format, type-check, or CI behavior.
- Consumers pin to a **git tag**, never `main`. After a meaningful change, bump
  `package.json` `version`, tag a release, and note what downstream repos must do
  to adopt it.
- Keep the two distribution models straight: *importable* configs (Prettier,
  tsconfig, ESLint, ruff) are live — they change behavior on the next install.
  *Starter templates* (workflows, dependabot, CODEOWNERS, lefthook, AGENTS
  content) are copied once when a repo is created and then owned locally; we do
  not demand they stay in sync, and drift is expected.

## Conventions

- Every directory's instructions live in `AGENTS.md` with a `CLAUDE.md` symlink.
- Workflow `uses:` are pinned to full commit SHAs with `# vX.Y.Z` comments;
  `scripts/check-action-pins.sh` enforces it.
- Locked toolchain decisions and pinned versions live in `README.md` and
  `versions.json` — keep them in sync with the actual config files.

## Git workflow

- Never push to `main`. Work on a branch and open a draft PR.
