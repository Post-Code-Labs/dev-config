import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const fixtureRoot = fileURLToPath(new URL('./fixtures/typescript/', import.meta.url));

function runTsc(fixture, ...args) {
  const project = fileURLToPath(
    new URL(`./fixtures/typescript/${fixture}/tsconfig.json`, import.meta.url),
  );
  const result = spawnSync('tsc', ['--project', project, '--pretty', 'false', ...args], {
    cwd: fixtureRoot,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout;
}

const resolvedConfig = (fixture) => JSON.parse(runTsc(fixture, '--showConfig'));

test('bundler baseline resolves and type-checks as ES2024', () => {
  const config = resolvedConfig('bundler');
  assert.equal(config.compilerOptions.module, 'esnext');
  assert.equal(config.compilerOptions.moduleResolution, 'bundler');
  assert.deepEqual(config.compilerOptions.lib, ['es2024']);
  runTsc('bundler');
});

test('Node baseline resolves and type-checks with NodeNext semantics', () => {
  const config = resolvedConfig('node');
  assert.equal(config.compilerOptions.module, 'nodenext');
  assert.equal(config.compilerOptions.moduleResolution, 'nodenext');
  runTsc('node');
});

test('React baseline stays on the locked ES2024 contract', () => {
  const config = resolvedConfig('react');
  assert.deepEqual(config.compilerOptions.lib, ['dom', 'dom.iterable', 'es2024']);
  runTsc('react');
});
