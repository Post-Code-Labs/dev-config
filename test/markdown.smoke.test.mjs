// Validates the shipped markdownlint base: well-formed, with the Prettier-vs-markdownlint
// split (formatting rules off, structural rules on). Consumers exercise rules in their CI.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

// Full-line `//` comments + no trailing commas → dropping comment lines yields JSON.
const raw = readFileSync(fileURLToPath(new URL('../markdown/base.jsonc', import.meta.url)), 'utf8');
const json = raw
  .split('\n')
  .filter((line) => !line.trim().startsWith('//'))
  .join('\n');

// Rules Prettier's formatting owns; markdownlint must cede them to avoid conflicts.
const PRETTIER_OWNED = ['MD004', 'MD007', 'MD009', 'MD010', 'MD012', 'MD013', 'MD030', 'MD046', 'MD048'];
// Structural rules that must remain enforced (absent key => inherits default:true).
const STRUCTURAL = ['MD001', 'MD025', 'MD040', 'MD041'];

test('markdown base parses as JSON once comments are stripped', () => {
  assert.doesNotThrow(() => JSON.parse(json));
});

test('markdown base cedes formatting to Prettier and keeps structural rules on', () => {
  const config = JSON.parse(json);
  assert.equal(config.default, true, 'all rules enabled by default');
  for (const rule of PRETTIER_OWNED) {
    assert.equal(config[rule], false, `${rule} (Prettier-owned) must be disabled`);
  }
  for (const rule of STRUCTURAL) {
    assert.notEqual(config[rule], false, `${rule} (structural) must stay enabled`);
  }
  assert.deepEqual(config.MD024, { siblings_only: true }, 'duplicate-heading rule scoped to siblings');
});
