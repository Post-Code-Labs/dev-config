const DEFAULT_MAXIMUM = 250;
const AGENTS_FILE = /(?:^|[/\\])AGENTS\.md$/u;

export default {
  names: ['agents-max-lines'],
  description: 'AGENTS.md files should stay within the configured line limit',
  tags: ['agents'],
  parser: 'none',
  function: (params, onError) => {
    if (!AGENTS_FILE.test(params.name)) return;

    const { maximum = DEFAULT_MAXIMUM, ignore_blank_lines = false } = params.config ?? {};
    if (!Number.isInteger(maximum) || maximum < 1) {
      throw new Error('agents-max-lines maximum must be a positive integer');
    }
    if (typeof ignore_blank_lines !== 'boolean') {
      throw new Error('agents-max-lines ignore_blank_lines must be a boolean');
    }

    const countedLines = params.lines
      .map((line, index) => ({ line, lineNumber: index + 1 }))
      .filter(({ line }) => !ignore_blank_lines || line.trim().length > 0);
    if (countedLines.length <= maximum) return;

    onError({
      lineNumber: countedLines[maximum].lineNumber,
      detail: `Expected at most ${maximum} lines, found ${countedLines.length}.`,
    });
  },
};
