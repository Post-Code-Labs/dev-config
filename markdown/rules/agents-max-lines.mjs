import { createMaxLinesRule } from './create-max-lines-rule.mjs';

export default createMaxLinesRule({
  name: 'agents-max-lines',
  description: 'AGENTS.md files should stay within the configured line limit',
  tags: ['agents'],
  filePattern: /(?:^|[/\\])AGENTS\.md$/u,
  maximum: 250,
  ignoreBlankLines: true,
});
