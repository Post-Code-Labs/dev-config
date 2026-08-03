// baseConfig enforces the core rules the presets omit and eslint-config-prettier keeps:
// eqeqeq and no-console.
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import { ESLint } from 'eslint';

import { baseConfig } from '../eslint/base.mjs';

const fixtureDir = fileURLToPath(new URL('./fixtures/', import.meta.url));

/** Lint one fixture with baseConfig and return its messages. */
async function lintFixture(file) {
  const eslint = new ESLint({
    cwd: fixtureDir,
    overrideConfigFile: true,
    overrideConfig: baseConfig({ tsconfigRootDir: fixtureDir }),
  });
  const [result] = await eslint.lintFiles([
    fileURLToPath(new URL(`./fixtures/${file}`, import.meta.url)),
  ]);
  return result.messages;
}

test('baseConfig enforces eqeqeq and no-console', async () => {
  const ids = new Set((await lintFixture('core-rules.ts')).map((message) => message.ruleId));
  for (const rule of ['eqeqeq', 'no-console']) {
    assert.ok(ids.has(rule), `expected ${rule} to fire; got: ${[...ids].join(', ')}`);
  }
});

test('baseConfig applies custom rules to .mts and .cts files', async () => {
  for (const file of ['module.mts', 'module.cts']) {
    const ids = new Set((await lintFixture(file)).map((message) => message.ruleId));
    assert.ok(
      ids.has('eqeqeq'),
      `expected eqeqeq to fire for ${file}; got: ${[...ids].join(', ')}`,
    );
  }
});

test('baseConfig disables typed rules for the JavaScript family', async () => {
  const messages = await lintFixture('anon-default.jsx');
  assert.equal(
    messages.some((message) => message.fatal),
    false,
    `expected JavaScript to lint without a typed-parser failure; got: ${messages
      .map((message) => message.message)
      .join(', ')}`,
  );
});
