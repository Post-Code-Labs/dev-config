// Smoke-test fixture for the non-React path: a single type-aware base violation
// (@typescript-eslint/no-floating-promises) so `baseConfig` can be checked on its own.
async function persist(): Promise<void> {
  // no-op
}

persist();
