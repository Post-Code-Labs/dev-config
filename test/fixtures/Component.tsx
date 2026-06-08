// Fixture: violates one rule per reactConfig layer — react-hooks/rules-of-hooks (conditional hook)
// and @typescript-eslint/no-floating-promises (unhandled promise).
import { useState } from 'react';

async function persist(): Promise<void> {
  // no-op
}

export function Widget({ enabled }: { enabled: boolean }): null {
  if (enabled) {
    useState(0);
  }

  persist();

  return null;
}
