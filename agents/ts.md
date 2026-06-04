## TypeScript conventions

- Prefer TypeScript-only changes; keep plain JavaScript out of the project.
- Preserve the Next.js App Router structure unless a migration plan says
  otherwise.
- Reuse before building: prefer existing components/primitives and shared types
  rather than designing from scratch.
- TypeScript builds target `ES2024` under strict mode (see the shared
  `tsconfig.base.json`). Per-package tsconfig adds only `paths`, `plugins`, and
  `include`/`exclude`.
- ESLint runs the shared strict, type-checked preset (`strictTypeChecked` +
  `stylisticTypeChecked` + sonarjs + import ordering + complexity guardrails).
  Don't disable rules inline to dodge a finding; fix the code or justify a
  scoped override.
- The package manager is **pnpm**. Use `pnpm run <script>` and
  `pnpm --filter <name> run <script>` for a single workspace.
