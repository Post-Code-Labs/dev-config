## Code Quality

- Keep code concise and focused on high-quality, type-safe implementation.
- Do not create a new function when an existing utility function can do the job.
- Do not avoid type issues by casting to `any` or commenting out the issue; use
  types that are as accurate as possible.
- Prefer small, reviewable changes.

## Working Rules

- Confirm and document major architectural decisions before expanding code or
  file-system footprint.
- Align new code with the product direction described in `README.md` and the
  relevant subdirectory `README`/`AGENTS.md` files.

## Instruction files

Each directory's coding-agent instructions live in `AGENTS.md`; `CLAUDE.md` is a
symlink to it so every agent reads the same file. Edit the `AGENTS.md`. Scoped
files inherit the root and add only what's local — they never restate or
override global rules.

## Verification

Run the relevant checks before handing off completed changes:

- **Format** — `pnpm run format:check` (Prettier). Fix with `pnpm run format`.
- **Lint** — `pnpm run lint` (ESLint).
- **Typecheck** — `pnpm run typecheck` (`tsc --noEmit`).
- **Test** — `pnpm run test` (Vitest). Run before committing changes that affect
  runtime behavior or tests.
- **Build** — `pnpm run build` when changes affect routing, rendering,
  dependencies, config, or production behavior.

Local git hooks (lefthook) are a fast feedback accelerator on staged files, not
a gate — CI is authoritative. They install via the `prepare` script on
`pnpm install`; bypass with `--no-verify` when necessary.

## Git Workflow

- Never commit, merge, or push directly to `main`. Always work in a branch or
  worktree; keep the primary checkout on `main` and untouched.
- Keep the `origin` remote on SSH so pushes use the configured authorization.
- Run the appropriate formatters, type-checkers, linters, and tests before
  committing.
- Open a pull request (as a draft) to merge into `main` when the work is ready.

## Dependencies & CI

- Shared baseline tooling (Prettier, tsconfig, ESLint, ruff, CI, hooks) comes
  from `@builtbydoug/dev-config`, pinned to a tag. Don't fork these locally;
  change them upstream and bump the pin.
- Dependabot opens grouped weekly update PRs (npm/uv/actions); merging is a
  human task.
- Pin every `uses:` in `.github/workflows/*` to a full commit SHA with a
  trailing `# vX.Y.Z` comment — never a moving tag. `scripts/check-action-pins.sh`
  enforces this.
