// Smoke-test fixture. Deliberately violates one rule from each layer of `reactConfig`:
//   - react-hooks/rules-of-hooks  (Next/React layer): a hook called conditionally
//   - @typescript-eslint/no-floating-promises (shared base, type-aware): unhandled promise
import { useState } from 'react';

async function persist(): Promise<void> {
  // no-op; its return type makes the floating call below type-aware-detectable
}

export function Widget({ enabled }: { enabled: boolean }): null {
  if (enabled) {
    useState(0);
  }

  persist();

  return null;
}
