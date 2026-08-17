import assert from 'node:assert/strict';
import { test } from 'node:test';

import rule from '@post-code-labs/dev-config/markdown/rules/agents-max-lines';

function runRule({ name = 'AGENTS.md', lineCount, lines, config = {} }) {
  const errors = [];
  rule.function(
    {
      name,
      lines: lines ?? Array.from({ length: lineCount }, () => 'instruction'),
      config,
    },
    (error) => errors.push(error),
  );
  return errors;
}

test('allows 250 lines and reports the first excess line by default', () => {
  assert.deepEqual(runRule({ lineCount: 250 }), []);
  assert.deepEqual(runRule({ lineCount: 251 }), [
    {
      lineNumber: 251,
      detail: 'Expected at most 250 lines, found 251.',
    },
  ]);
});

test('checks nested AGENTS.md files but ignores other Markdown files', () => {
  assert.equal(runRule({ name: 'packages/models/AGENTS.md', lineCount: 251 }).length, 1);
  assert.deepEqual(runRule({ name: 'README.md', lineCount: 251 }), []);
});

test('supports a positive-integer maximum override', () => {
  assert.deepEqual(runRule({ lineCount: 3, config: { maximum: 3 } }), []);
  assert.equal(runRule({ lineCount: 4, config: { maximum: 3 } }).length, 1);
  assert.throws(
    () => runRule({ lineCount: 1, config: { maximum: 0 } }),
    /maximum must be a positive integer/u,
  );
});

test('can ignore empty and whitespace-only lines', () => {
  const lines = ['one', '', '  ', 'two', 'three', '\t', 'four'];
  assert.deepEqual(
    runRule({
      lines: lines.slice(0, 6),
      config: { maximum: 3, ignore_blank_lines: true },
    }),
    [],
  );
  assert.deepEqual(runRule({ lines, config: { maximum: 3, ignore_blank_lines: true } }), [
    {
      lineNumber: 7,
      detail: 'Expected at most 3 lines, found 4.',
    },
  ]);
  assert.equal(runRule({ lines, config: { maximum: 3 } }).length, 1);
});
