# TypeScript base configs

- `tsconfig.base.json` — strict baseline for code processed by a bundler (no DOM
  lib, no JSX).
- `tsconfig.node.json` — extends the base with `NodeNext` module and resolution
  semantics for code executed directly by Node.
- `tsconfig.react.json` — extends the base and adds `DOM` libs + `jsx: preserve`
  for Next.js apps.

Per-repo `tsconfig.json` extends one of these and adds only what's local —
`paths`, `plugins` (e.g. `next`), `include`/`exclude`:

```jsonc
// apps/webapp/tsconfig.json
{
  "extends": "@post-code-labs/dev-config/typescript/tsconfig.react.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] },
  },
  "include": ["./src/**/*.ts", "./src/**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"],
}
```

```jsonc
// packages/<lib>/tsconfig.json
{
  "extends": "@post-code-labs/dev-config/typescript/tsconfig.node.json",
  "compilerOptions": { "paths": { "@logging/*": ["../logging/src/*"] } },
  "include": ["./src/**/*.ts"],
}
```

Use `tsconfig.base.json` for libraries or applications whose imports are resolved
by a bundler. NodeNext intentionally enforces Node's ESM/CJS and relative-import
extension rules, preventing the type-checker from accepting imports that fail at
runtime.

The base sets `noEmit: true`. A package that emits declarations overrides
`noEmit`, `outDir`, `declaration`, etc. locally.
