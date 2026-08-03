import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import { format } from 'prettier';

const config = JSON.parse(
  readFileSync(fileURLToPath(new URL('../prettier/index.json', import.meta.url)), 'utf8'),
);

test('Prettier executes the shipped formatting contract', async () => {
  const formatted = await format('const greeting = "hello"\n', {
    ...config,
    parser: 'typescript',
  });

  assert.equal(formatted, "const greeting = 'hello';\n");
});
