# Shared AGENTS.md blocks

Markdown can't be `import`ed, so the shared agent constitution is distributed as
**blocks you paste into each repo's root `AGENTS.md`** between marker comments,
then refresh deliberately when this canon changes.

- `base.md` — the repo-agnostic core (Code Quality, Working Rules, Verification,
  Git Workflow, instruction-file convention). Goes in every repo.
- `ts.md` — TypeScript-side conventions. Add to TS/JS repos.
- `python.md` — Python-side conventions. Add to repos with a `python/` tree.

## Convention recap

Every directory's instruction file is an `AGENTS.md`; `CLAUDE.md` is a **symlink**
to it so Claude Code and other agents read the same file. Create the pair with:

```bash
ln -s AGENTS.md CLAUDE.md
```

## Paste markers

Wrap the shared content in each repo's `AGENTS.md` like this, and keep your
repo-specific sections (layout, product direction, deploy) outside the markers:

```markdown
<!-- dev-config:base:start -->
...contents of agents/base.md...
<!-- dev-config:base:end -->
```

A future `sync-config.sh --agents` pass can replace everything between the
markers from the pinned dev-config version. Until then, refresh by hand.
