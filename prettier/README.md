# Prettier base config

`index.json` is the canonical style for every repo:

```json
{ "semi": true, "singleQuote": true, "trailingComma": "all", "printWidth": 100, "tabWidth": 2 }
```

## Plain consumption

```jsonc
// package.json
{ "prettier": "@post-code-labs/dev-config/prettier" }
```

## With plugins (e.g. Tailwind)

The base intentionally ships **no plugins** so non-Tailwind repos don't have to
install them. A repo that needs a plugin re-exports the base and adds its own:

```js
// .prettierrc.mjs
import base from '@post-code-labs/dev-config/prettier' with { type: 'json' };

export default {
  ...base,
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindStylesheet: './src/styles/tailwind.css',
};
```

> Adopting this style reformats any repo not already on it (one isolated
> `style: adopt shared prettier config` commit). Land it separately from
> feature work to keep blame churn contained.
