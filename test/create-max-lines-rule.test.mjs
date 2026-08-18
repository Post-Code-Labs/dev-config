import assert from 'node:assert/strict';
import { test } from 'node:test';

import createMaxLinesRule, {
  createMaxLinesRule as namedFactory,
} from '@post-code-labs/dev-config/markdown/rules/create-max-lines-rule';

const options = {
  name: 'changelog-max-lines',
  description: 'CHANGELOG.md files should stay within the configured line limit',
  tags: ['changelog'],
  filePattern: /(?:^|[/\\])CHANGELOG\.md$/u,
  maximum: 5,
};

function runRule(rule, { name, lines, config = {} }) {
  const errors = [];
  rule.function({ name, lines, config }, (error) => errors.push(error));
  return errors;
}

test('exposes the factory as both the default and a named export', () => {
  assert.equal(createMaxLinesRule, namedFactory);
});

test('builds a rule scoped to the supplied file pattern', () => {
  const rule = createMaxLinesRule(options);
  assert.deepEqual(rule.names, ['changelog-max-lines']);
  assert.equal(rule.description, options.description);
  assert.deepEqual(rule.tags, ['changelog']);
  assert.equal(rule.parser, 'none');

  const lines = Array.from({ length: 6 }, () => 'entry');
  assert.equal(runRule(rule, { name: 'docs/CHANGELOG.md', lines }).length, 1);
  assert.deepEqual(runRule(rule, { name: 'docs/HISTORY.md', lines }), []);
});

test('ignores blank lines by default and can be built to count them', () => {
  const lines = ['one', '', '  ', 'two', 'three', '\t', 'four'];
  assert.deepEqual(
    runRule(createMaxLinesRule({ ...options, maximum: 4 }), {
      name: 'CHANGELOG.md',
      lines,
    }),
    [],
  );
  assert.deepEqual(
    runRule(createMaxLinesRule({ ...options, maximum: 4, ignoreBlankLines: false }), {
      name: 'CHANGELOG.md',
      lines,
    }),
    [{ lineNumber: 5, detail: 'Expected at most 4 lines, found 7.' }],
  );
});

test('config overrides win over the factory defaults', () => {
  const rule = createMaxLinesRule(options);
  const lines = Array.from({ length: 6 }, () => 'entry');
  assert.deepEqual(runRule(rule, { name: 'CHANGELOG.md', lines, config: { maximum: 6 } }), []);
});

test('rejects invalid factory options', () => {
  assert.throws(
    () => createMaxLinesRule({ ...options, name: '' }),
    /name must be a non-empty string/u,
  );
  assert.throws(
    () => createMaxLinesRule({ ...options, filePattern: 'CHANGELOG.md' }),
    /filePattern must be a regular expression/u,
  );
  assert.throws(
    () => createMaxLinesRule({ ...options, filePattern: /CHANGELOG\.md$/gu }),
    /filePattern must not use the global or sticky flag/u,
  );
  assert.throws(
    () => createMaxLinesRule({ ...options, maximum: 0 }),
    /maximum must be a positive integer/u,
  );
  assert.throws(
    () => createMaxLinesRule({ ...options, ignoreBlankLines: 'yes' }),
    /ignore_blank_lines must be a boolean/u,
  );
});
