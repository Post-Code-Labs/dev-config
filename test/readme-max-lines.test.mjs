import assert from 'node:assert/strict';
import { test } from 'node:test';

import rule from '@post-code-labs/dev-config/markdown/rules/readme-max-lines';

function runRule({ name = 'README.md', lineCount, lines, config = {} }) {
  const errors = [];
  rule.function(
    {
      name,
      lines: lines ?? Array.from({ length: lineCount }, () => 'documentation'),
      config,
    },
    (error) => errors.push(error),
  );
  return errors;
}

test('allows 300 lines and reports the first excess line by default', () => {
  assert.deepEqual(runRule({ lineCount: 300 }), []);
  assert.deepEqual(runRule({ lineCount: 301 }), [
    {
      lineNumber: 301,
      detail: 'Expected at most 300 lines, found 301.',
    },
  ]);
});

test('checks nested README.md files but ignores other Markdown files', () => {
  assert.equal(runRule({ name: 'packages/models/README.md', lineCount: 301 }).length, 1);
  assert.deepEqual(runRule({ name: 'AGENTS.md', lineCount: 301 }), []);
});

test('ignores blank lines by default and honours overrides', () => {
  const lines = ['one', '', '  ', 'two', 'three', '\t', 'four'];
  assert.deepEqual(runRule({ lines, config: { maximum: 4 } }), []);
  assert.equal(runRule({ lines, config: { maximum: 4, ignore_blank_lines: false } }).length, 1);
});
