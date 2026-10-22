import { describe, expect, it } from '@rstest/core';
import { stripJsx, stripPageContent } from '../cleanSearchIndex';

describe('stripJsx', () => {
  it('removes a StoryPreview opening tag with an import() attribute', () => {
    const src =
      "<StoryPreview load={() => import('../../../../packages/design-system/src/components/Button/Button.stories.tsx')} name='Basic'>";
    expect(stripJsx(src).trim()).toBe('');
  });

  it('removes closing tags and self-closing Explorer tags', () => {
    const src = "a\n</StoryPreview>\n<Explorer load={() => import('x')} name='Y' />\nb";
    const out = stripJsx(src);
    expect(out).not.toMatch(/StoryPreview|Explorer|import\(/);
    expect(out).toContain('a');
    expect(out).toContain('b');
  });

  it('keeps plain prose and lowercase html-ish text', () => {
    const src = 'Use a Button with a < b comparison.\n\nSecond paragraph.';
    expect(stripJsx(src)).toBe(src);
  });

  it('removes a TokenTable with a long multi-line JSON attribute', () => {
    const src = `intro\n<TokenTable tokens={[\n  { "name": "--color-a", "value": "#fff" },\n  { "name": "--color-b", "value": "#000" }\n]} />\noutro`;
    const out = stripJsx(src);
    expect(out).not.toMatch(/TokenTable|--color-a/);
    expect(out).toContain('intro');
    expect(out).toContain('outro');
  });
});

describe('stripPageContent', () => {
  it('keeps heading offsets pointing at the same text', () => {
    const content = "<StoryPreview name='A'>\nUsage\nbody <Explorer name='B' />\nProps\nrest";
    const toc = [{ charIndex: content.indexOf('Usage') }, { charIndex: content.indexOf('Props') }];
    const out = stripPageContent(content, toc);
    expect(out.content.slice(out.charIndexes[0])).toMatch(/^Usage/);
    expect(out.content.slice(out.charIndexes[1])).toMatch(/^Props/);
    expect(out.content).not.toMatch(/StoryPreview|Explorer/);
  });
});
