# TypeScript base configs

- `tsconfig.base.json` — Node-targeted strict baseline (no DOM lib, no JSX).
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
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["./src/**/*.ts", "./src/**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

```jsonc
// packages/<lib>/tsconfig.json
{
  "extends": "@post-code-labs/dev-config/typescript/tsconfig.base.json",
  "compilerOptions": { "paths": { "@logging/*": ["../logging/src/*"] } },
  "include": ["./src/**/*.ts"]
}
```

The base sets `noEmit: true`. A package that emits declarations overrides
`noEmit`, `outDir`, `declaration`, etc. locally.
