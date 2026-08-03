import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

test('the dry-run package contains every advertised export', () => {
  const cache = mkdtempSync(join(tmpdir(), 'dev-config-npm-cache-'));
  const result = spawnSync('npm', ['pack', '--dry-run', '--json', '--cache', cache], {
    cwd: root,
    encoding: 'utf8',
  });
  rmSync(cache, { force: true, recursive: true });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const [pack] = JSON.parse(result.stdout);
  const packedPaths = new Set(pack.files.map(({ path }) => path));
  for (const target of Object.values(manifest.exports)) {
    const path = target.replace(/^\.\//, '');
    assert.ok(packedPaths.has(path), `missing exported path from package: ${path}`);
  }
});
