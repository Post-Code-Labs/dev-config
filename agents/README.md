# Starter AGENTS.md content

Markdown can't be `import`ed, so these files are **starter content** for a new
repo's `AGENTS.md`, not a synced canon. Copy the relevant blocks into a repo's
root `AGENTS.md` when you create it, then **adapt and own them locally** — they
will and should drift from here as a repo grows. dev-config does not demand they
stay in sync.

- `base.md` — repo-agnostic core (Code Quality, Working Rules, Verification, Git
  Workflow, instruction-file convention). A good starting point for any repo.
- `ts.md` — TypeScript-side conventions. Add to TS/JS repos.
- `python.md` — Python-side conventions. Add to repos with a `python/` tree.

## Convention recap

Every directory's instruction file is an `AGENTS.md`; `CLAUDE.md` is a **symlink**
to it so Claude Code and other agents read the same file. Create the pair with:

```bash
ln -s AGENTS.md CLAUDE.md
```

Keep each repo's specifics (layout, product direction, deploy, design system)
in its own sections — only the genuinely shared baseline starts from here.
