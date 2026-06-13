// baseConfig enforces the core rules the presets omit and eslint-config-prettier keeps:
// eqeqeq and no-console.
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import { ESLint } from 'eslint';

import { baseConfig } from '../eslint/base.mjs';

const fixtureDir = fileURLToPath(new URL('./fixtures/', import.meta.url));

/** Lint one fixture with baseConfig and return the set of reported rule ids. */
async function lintFixture(file) {
  const eslint = new ESLint({
    cwd: fixtureDir,
    overrideConfigFile: true,
    overrideConfig: baseConfig({ tsconfigRootDir: fixtureDir }),
  });
  const [result] = await eslint.lintFiles([
    fileURLToPath(new URL(`./fixtures/${file}`, import.meta.url)),
  ]);
  return new Set(result.messages.map((m) => m.ruleId));
}

test('baseConfig enforces eqeqeq and no-console', async () => {
  const ids = await lintFixture('core-rules.ts');
  for (const rule of ['eqeqeq', 'no-console']) {
    assert.ok(ids.has(rule), `expected ${rule} to fire; got: ${[...ids].join(', ')}`);
  }
});
