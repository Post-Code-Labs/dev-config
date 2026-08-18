import { createMaxLinesRule } from './create-max-lines-rule.mjs';

export default createMaxLinesRule({
  name: 'readme-max-lines',
  description: 'README.md files should stay within the configured line limit',
  tags: ['readme'],
  filePattern: /(?:^|[/\\])README\.md$/u,
  maximum: 300,
  ignoreBlankLines: true,
});
