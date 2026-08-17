# Markdown configuration

`base.jsonc` is the shared markdownlint structural baseline. Prettier owns Markdown formatting.

## AGENTS.md line limit

The `agents-max-lines` custom rule limits every `AGENTS.md` file to 250 physical lines by default.
Load it from the consuming repository's markdownlint-cli2 configuration:

```jsonc
{
  "customRules": ["@post-code-labs/dev-config/markdown/rules/agents-max-lines"],
}
```

The shared base enables all loaded rules. A repository can override the limit in its markdownlint
configuration when necessary:

```jsonc
{
  "extends": "./node_modules/@post-code-labs/dev-config/markdown/base.jsonc",
  "agents-max-lines": { "maximum": 300 },
}
```

Set `ignore_blank_lines` to exclude empty and whitespace-only lines from the count:

```jsonc
{
  "agents-max-lines": { "ignore_blank_lines": true },
}
```
