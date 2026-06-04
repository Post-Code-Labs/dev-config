## Python conventions

- The Python workspace is managed with **uv**. Never drive Python through pnpm.
- Lint/format with **ruff**, type-check with **mypy** in **strict** mode, test
  with **pytest**. Don't silence type errors with `# type: ignore`; use accurate
  types.
- ruff lint baseline: `E, F, I, UP, B, C901` with mccabe `max-complexity = 10`
  (see the shared `python/ruff.toml`).
- Dead code is checked with **vulture**; curate false positives in the
  whitelist rather than loosening the gate.
- Run per-package tooling directly: `cd python/<member> && uv run …`. Where a
  polyglot `Makefile` exists, `make <target>` fans out across both ecosystems.
