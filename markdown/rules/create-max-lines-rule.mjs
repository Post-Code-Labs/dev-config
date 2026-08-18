// Factory for markdownlint rules that cap how many lines a matching file may contain.
// Rule implementations (agents-max-lines, readme-max-lines) supply the defaults; the
// consuming repository overrides them through its markdownlint config.

const assertMaximum = (ruleName, maximum) => {
  if (!Number.isInteger(maximum) || maximum < 1) {
    throw new Error(`${ruleName} maximum must be a positive integer`);
  }
};

const assertIgnoreBlankLines = (ruleName, ignoreBlankLines) => {
  if (typeof ignoreBlankLines !== 'boolean') {
    throw new Error(`${ruleName} ignore_blank_lines must be a boolean`);
  }
};

/**
 * Build a markdownlint rule that limits matching files to `maximum` lines.
 *
 * @param {object} options
 * @param {string} options.name Rule name used in markdownlint config and error messages.
 * @param {string} options.description Rule description surfaced by markdownlint.
 * @param {RegExp} options.filePattern Matched against the linted file's path.
 * @param {number} options.maximum Default line limit; overridable via `maximum`.
 * @param {boolean} [options.ignoreBlankLines] Default for the `ignore_blank_lines` option.
 * @param {string[]} [options.tags] markdownlint tags for the rule.
 * @returns {object} A markdownlint custom rule.
 */
export const createMaxLinesRule = ({
  name,
  description,
  filePattern,
  maximum: defaultMaximum,
  ignoreBlankLines: defaultIgnoreBlankLines = true,
  tags = [],
}) => {
  if (typeof name !== 'string' || name.length === 0) {
    throw new Error('createMaxLinesRule name must be a non-empty string');
  }
  if (!(filePattern instanceof RegExp)) {
    throw new Error(`${name} filePattern must be a regular expression`);
  }
  // `g`/`y` make `test` stateful, so the same file would match only every other run.
  if (filePattern.global || filePattern.sticky) {
    throw new Error(`${name} filePattern must not use the global or sticky flag`);
  }
  assertMaximum(name, defaultMaximum);
  assertIgnoreBlankLines(name, defaultIgnoreBlankLines);

  return {
    names: [name],
    description,
    tags,
    parser: 'none',
    function: (params, onError) => {
      if (!filePattern.test(params.name)) return;

      const {
        maximum = defaultMaximum,
        ignore_blank_lines: ignoreBlankLines = defaultIgnoreBlankLines,
      } = params.config ?? {};
      assertMaximum(name, maximum);
      assertIgnoreBlankLines(name, ignoreBlankLines);

      const countedLines = params.lines
        .map((line, index) => ({ line, lineNumber: index + 1 }))
        .filter(({ line }) => !ignoreBlankLines || line.trim().length > 0);
      if (countedLines.length <= maximum) return;

      onError({
        lineNumber: countedLines[maximum].lineNumber,
        detail: `Expected at most ${maximum} lines, found ${countedLines.length}.`,
      });
    },
  };
};

export default createMaxLinesRule;
