# Markdown configuration

`base.jsonc` is the shared markdownlint structural baseline. Prettier owns Markdown formatting.

## Line-limit rules

`create-max-lines-rule.mjs` builds a markdownlint rule that caps the line count of every file
matching a regular expression. Two ready-made rules ship on top of it:

| Rule               | Files matched | Default maximum |
| ------------------ | ------------- | --------------- |
| `agents-max-lines` | `AGENTS.md`   | 250             |
| `readme-max-lines` | `README.md`   | 300             |

Both ignore empty and whitespace-only lines by default. Load them from the consuming repository's
markdownlint-cli2 configuration:

```jsonc
{
  "customRules": [
    "@post-code-labs/dev-config/markdown/rules/agents-max-lines",
    "@post-code-labs/dev-config/markdown/rules/readme-max-lines",
  ],
}
```

The shared base enables all loaded rules. A repository can override the limit, or count blank lines
again, in its markdownlint configuration:

```jsonc
{
  "extends": "./node_modules/@post-code-labs/dev-config/markdown/base.jsonc",
  "agents-max-lines": { "maximum": 300 },
  "readme-max-lines": { "ignore_blank_lines": false },
}
```

## Line limits for other files

Call the factory directly to cap any other file. It returns a markdownlint custom rule, so a repo
points `customRules` at its own module:

```js
import { createMaxLinesRule } from '@post-code-labs/dev-config/markdown/rules/create-max-lines-rule';

export default createMaxLinesRule({
  name: 'changelog-max-lines',
  description: 'CHANGELOG.md files should stay within the configured line limit',
  tags: ['changelog'],
  filePattern: /(?:^|[/\\])CHANGELOG\.md$/u,
  maximum: 400,
  ignoreBlankLines: true,
});
```

`filePattern` is matched against the linted file's path and must not use the `g` or `y` flag.
`maximum` and `ignoreBlankLines` are defaults: markdownlint config still overrides them per repo
through the rule's `maximum` and `ignore_blank_lines` options.
