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

describe('stripJsx bounds', () => {
  it('keeps inline code with a tag', () => {
    const src = 'Pass `<Button>` and `</Button>` here.';
    expect(stripJsx(src)).toBe(src);
  });

  it('does not swallow prose after an unclosed inline `<Button`', () => {
    const src = 'Use `<Button` for actions.\n\nSecond paragraph.\n\nWhen a > b holds.';
    expect(stripJsx(src)).toBe(src);
  });

  it('ignores > inside a quoted attribute', () => {
    expect(stripJsx("x <Badge text='a > b' /> y")).toBe('x  y');
  });

  it('keeps an unterminated tag as text', () => {
    const src = 'before <Foo bar={1 and never closed';
    expect(stripJsx(src)).toBe(src);
  });

  it('keeps children between tags', () => {
    expect(stripJsx('<Tabs>inner text</Tabs>')).toBe('inner text');
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
