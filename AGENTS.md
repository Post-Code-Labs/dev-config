# dev-config — coding-agent instructions

This repo is the single source of truth for the **importable baseline configs**
that consuming repos depend on: Prettier, tsconfig, ESLint, ruff/mypy, sqlfluff,
and markdownlint. It has no application code. Its outputs are other repos'
lint/format/type behavior, so the bar is correctness and predictability. See
`README.md` for the full consumption model and the locked decisions.

## What qualifies to live here

Add an artifact only if **all** hold — otherwise it stays in the consuming repo
(or a separate template repo):

1. **Consumed by reference, not copy** — `extends`/`import`-ed, so an edit
   propagates on install. If adoption means copying a file, it does not qualify.
2. **Universally correct** — right for every consumer, not one project's taste.
   Anything needing per-repo divergence is exposed as an overridable base.
3. **Behavior-defining and mechanically checkable** — sets lint/format/type/CI
   behavior a tool can verify, so "in sync" is provable.
4. **A stable, versioned contract** — clear import path, shipped under a tag.

Exception to (1): the Python tree's ruff/mypy/sqlfluff have no reference mechanism,
so they're mirrored by copy and kept in sync.

Explicitly out of scope: one-time scaffold (AGENTS.md content, CODEOWNERS,
dependabot, lefthook, PR templates). Those belong in a template repo, not here —
don't reintroduce them.

## Keeping quality high

- **Identical inputs → identical outputs.** Pin in `versions.json` exactly the
  toolchain the shipped configs depend on; keep the inputs minimal and
  composable (small base + documented override seam, not a project's full config).
- **Breaking by default.** Treat every edit as breaking until shown otherwise.
  Prefer additive change; call out anything that alters lint/format/type/CI
  behavior and what consumers must do to adopt it.
- **Versioned adoption.** Consumers pin a **git tag**, never `main`. After a
  meaningful change, cut a CalVer tag (`YYYY.MM`, e.g. `2026.06`; same-month
  re-release appends `.N`) and note the migration. The tag is the version
  contract — the `package.json` `version` field is not.
- **Composition over forking.** Extend the base through its override seam rather
  than copying or special-casing a consumer here.
- **Resolvable surface.** Keep `package.json` `exports`/`files` in step with the
  files so every advertised import path resolves; confirm configs parse and
  presets load before tagging.

## Conventions

- The repo's own instructions live in `AGENTS.md` with a `CLAUDE.md` symlink.
- Locked toolchain decisions and pinned versions live in `README.md` and
  `versions.json` — keep them in step with the actual config files.

## Git workflow

- Never push to `main`. Work on a branch and open a draft PR.
