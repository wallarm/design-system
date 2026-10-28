import { describe, expect, it } from '@rstest/core';

import { WALLY_ANSWER } from '../mocks';
import { decodeEntities, isClosedFence, lexMarkdown, safeHref } from './markdown';

const types = (text: string, streaming = true) => lexMarkdown(text, streaming).map(t => t.type);

describe('lexMarkdown', () => {
  it('changes only the last block while the answer streams', () => {
    const final = lexMarkdown(WALLY_ANSWER, false).map(t => t.raw);
    for (let n = 1; n <= WALLY_ANSWER.length; n++) {
      const blocks = lexMarkdown(WALLY_ANSWER.slice(0, n), true);
      blocks.slice(0, -1).forEach((b, i) => {
        expect(b.raw, `prefix ${n}, block ${i}`).toBe(final[i]);
      });
    }
  });

  it.each(['| a | b |', '| a | b |\n|--', '| IP', '- [', '- [x]', '1. [ ]', '```', '```ya'])(
    'holds back the pending tail %j',
    text => {
      expect(lexMarkdown(text, true)).toEqual([]);
    },
  );

  it('shows a table once its delimiter row is complete and a fence once it has code', () => {
    expect(types('| a | b |\n|---|---|')).toEqual(['table']);
    expect(types('```yaml\nx')).toEqual(['code']);
  });

  it('repairs only the tail, and only while streaming', () => {
    const blocks = lexMarkdown('Path /var/log/*.log\n\nNext **bo', true);
    expect(blocks[0]?.raw).toBe('Path /var/log/*.log');
    expect(blocks[1]?.raw).toBe('Next **bo**');
    expect(lexMarkdown('glob *.yaml', false)[0]?.raw).toBe('glob *.yaml');
    expect(JSON.stringify(lexMarkdown('Hosts (*.example.com) and', true))).not.toContain(
      '"type":"em"',
    );
  });
});

describe('isClosedFence', () => {
  it.each([
    ['```yaml\nx', false],
    ['```yaml\nx\n```', true],
    ['````\nx\n```', false],
    ['~~~\nx\n~~~', true],
    ['    indented code', true],
    ['```\nx\n```js', false],
  ])('%j → %s', (raw, closed) => {
    expect(isClosedFence(raw)).toBe(closed);
  });
});

describe('safeHref', () => {
  it.each([
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    ' javascript:alert(1)',
    '\tjava\nscript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    'file:///etc/passwd',
    'blob:https://a.example/1',
    '',
    null,
    undefined,
  ])('rejects %j', href => {
    expect(safeHref(href)).toBeUndefined();
  });

  it.each([
    '#x',
    './x',
    'x/y',
    '/x',
    '//host',
    'mailto:a@b.co',
    'https://docs.wallarm.com',
    ' https://docs.wallarm.com ',
    'javascript&colon;alert(1)',
  ])('allows %j verbatim', href => {
    expect(safeHref(href)).toBe(href);
  });
});

describe('decodeEntities', () => {
  it('decodes only the named entities marked leaves in text', () => {
    expect(decodeEntities('&amp; &lt;b&gt; &quot; &nbsp; &copy;')).toBe('& <b> "   &copy;');
  });
});
