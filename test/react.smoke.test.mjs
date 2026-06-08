// Smoke check for the shipped ESLint presets. The bug it guards: `reactConfig` threw
// `ConfigError: Cannot redefine plugin "@typescript-eslint"` (and would next throw it for
// `import`) because eslint-config-next and `baseConfig` both registered those plugins. The
// error only fires when a consumer's dependency tree resolves *divergent* plugin instances
// (a clean, deduped install masks it), so the tests below cover both:
//   - structural: `reactConfig` leaves base-owned plugin registration entirely to baseConfig;
//   - end-to-end: under forced divergence the old composition throws and the shipped fix does not;
//   - behavioral: the merged preset loads and enforces a rule from each layer.
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import { ESLint } from 'eslint';
import nextVitals from 'eslint-config-next/core-web-vitals';

import { baseConfig } from '../eslint/base.mjs';
import { reactConfig, withoutBaseOwnedPlugins } from '../eslint/react.mjs';

const BASE_OWNED_PLUGINS = ['@typescript-eslint', 'import'];
const fixtureDir = fileURLToPath(new URL('./fixtures/', import.meta.url));
const opts = { tsconfigRootDir: fixtureDir };

/** Lint one fixture file with a flat config and return its messages. */
async function lintFixture(overrideConfig, file) {
  const eslint = new ESLint({ cwd: fixtureDir, overrideConfigFile: true, overrideConfig });
  const [result] = await eslint.lintFiles([
    fileURLToPath(new URL(`./fixtures/${file}`, import.meta.url)),
  ]);
  return result.messages;
}

const ruleIds = (messages) => new Set(messages.map((m) => m.ruleId));
const definerCount = (configs, plugin) =>
  configs.filter((c) => c.plugins && plugin in c.plugins).length;

/** Clone the @typescript-eslint/import plugin objects so they are *different* instances than
 *  baseConfig's — reproducing a consumer tree that didn't dedupe eslint-config-next's copies. */
const withDivergentBaseOwnedPlugins = (configs) =>
  configs.map((c) => {
    if (!c.plugins) return c;
    const plugins = {};
    for (const [name, plugin] of Object.entries(c.plugins)) {
      plugins[name] = BASE_OWNED_PLUGINS.includes(name) ? { ...plugin } : plugin;
    }
    return { ...c, plugins };
  });

test('reactConfig leaves @typescript-eslint/import registration entirely to baseConfig', () => {
  // The regression is environment-independent here: the old preset added next's duplicate
  // registrations on top of baseConfig's; the fix removes them, so the definer counts match.
  const react = reactConfig(opts);
  const base = baseConfig(opts);
  for (const plugin of BASE_OWNED_PLUGINS) {
    assert.equal(
      definerCount(react, plugin),
      definerCount(base, plugin),
      `${plugin} should be registered only by baseConfig, not also by eslint-config-next`,
    );
    const refs = new Set(
      react.filter((c) => c.plugins && plugin in c.plugins).map((c) => c.plugins[plugin]),
    );
    assert.equal(
      refs.size,
      1,
      `${plugin} must resolve to a single plugin object across the preset`,
    );
  }
});

test('the un-deduped composition throws the redefine ConfigError, the fix does not', async () => {
  const divergent = withDivergentBaseOwnedPlugins(nextVitals);
  // Mirror reactConfig's react.version pin so the deduped case doesn't hit eslint-plugin-react's
  // ESLint-10 auto-detection crash (orthogonal to the redefine clash under test).
  const reactPin = { settings: { react: { version: '19.0' } } };
  const file = 'Component.tsx';

  await assert.rejects(
    () => lintFixture([...divergent, reactPin, ...baseConfig(opts)], file),
    /Cannot redefine plugin/,
    'the original [...nextVitals, ...baseConfig] composition must fail under divergent plugin instances',
  );
  await assert.doesNotReject(
    () => lintFixture([...withoutBaseOwnedPlugins(divergent), reactPin, ...baseConfig(opts)], file),
    'stripping next’s base-owned plugin definitions must remove the clash',
  );
});

test('reactConfig loads and enforces both the shared base and the Next/React layer', async () => {
  const ids = ruleIds(await lintFixture(reactConfig(opts), 'Component.tsx'));
  assert.ok(
    ids.has('@typescript-eslint/no-floating-promises'),
    `expected the type-aware base rule to fire; got: ${[...ids].join(', ')}`,
  );
  assert.ok(
    ids.has('react-hooks/rules-of-hooks'),
    `expected the Next/React rule to fire; got: ${[...ids].join(', ')}`,
  );
});

test('baseConfig still loads and lints on its own (non-React path unregressed)', async () => {
  const ids = ruleIds(await lintFixture(baseConfig(opts), 'base.ts'));
  assert.ok(
    ids.has('@typescript-eslint/no-floating-promises'),
    `expected the type-aware base rule to fire; got: ${[...ids].join(', ')}`,
  );
});

test('import/order reports violations on ESLint 10 (eslint-plugin-import-x, not the crashing fork)', async () => {
  // With eslint-plugin-import@2.32.0 this throws on ESLint 10 (removed getTokenOrCommentBefore);
  // eslint-plugin-import-x reports the violation instead.
  const ids = ruleIds(await lintFixture(baseConfig(opts), 'import-order.ts'));
  assert.ok(
    ids.has('import/order'),
    `expected import/order to be reported; got: ${[...ids].join(', ')}`,
  );
});
