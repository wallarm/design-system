import { createRef, type ReactNode } from 'react';

import { describe, expect, it, rs } from '@rstest/core';
import { render, screen } from '@testing-library/react';

import { AssistantMessage } from './AssistantMessage';
import { AssistantMessageContent } from './AssistantMessageContent';
import {
  AssistantMessageMarkdown,
  type AssistantMessageMarkdownComponents,
  type AssistantMessageMarkdownVariant,
} from './AssistantMessageMarkdown';
import {
  AssistantMessageMarkdownCodeBlock,
  type AssistantMessageMarkdownCodeBlockProps,
} from './AssistantMessageMarkdownCodeBlock';
import { AssistantMessageMarkdownInlineCode } from './AssistantMessageMarkdownInlineCode';
import { AssistantMessageMarkdownLink } from './AssistantMessageMarkdownLink';
import { AssistantMessageMarkdownTable } from './AssistantMessageMarkdownTable';
import { safeHref } from './lib/markdown';
import { HOSTILE, STREAMING_SNAPSHOTS, WALLY_ANSWER } from './mocks';

const renderMd = (
  text: string,
  props: {
    streaming?: boolean;
    variant?: AssistantMessageMarkdownVariant;
    components?: Partial<AssistantMessageMarkdownComponents>;
  } = {},
) =>
  render(
    <AssistantMessage data-testid='m'>
      <AssistantMessageContent>
        <AssistantMessageMarkdown text={text} {...props} />
      </AssistantMessageContent>
    </AssistantMessage>,
  );

const content = () => screen.getByTestId('m--content');
/** The content's markup without class attributes. */
const markup = () => content().innerHTML.replace(/ class="[^"]*"/g, '');

describe('AssistantMessageMarkdown — elements', () => {
  it('renders every default element of a full answer', () => {
    renderMd(WALLY_ANSWER);
    const root = content();
    expect(root.querySelector('h2')).toHaveTextContent('Attacks on /api/login');
    expect(root.querySelector('strong')).toHaveTextContent('3 attacks');
    expect(root.querySelector('strong')).toHaveClass('font-semibold');
    expect(root.querySelector('em')).toHaveTextContent('blocked');
    expect(root.querySelector('del')).toHaveTextContent('monitoring');
    expect(root).toHaveTextContent('203.0.113.7 & friends');

    const chips = screen.getAllByTestId('m--inline-code');
    expect(chips.map(c => c.textContent)).toEqual(['/api/login', '203.0.113.7', 'rule_id: 1042']);
    for (const chip of chips) expect(chip).toHaveAttribute('data-ds-suppress-parent-click', '');

    const table = screen.getByTestId('m--table');
    expect(table).toHaveAttribute('data-slot', 'assistant-message-markdown-table');
    const ths = table.querySelectorAll('th[scope=col]');
    expect(ths).toHaveLength(3);
    expect(ths[0]).toHaveClass('text-left');
    expect(ths[1]).toHaveClass('text-center');
    expect(ths[2]).toHaveClass('text-right');
    expect(table.querySelectorAll('tbody tr')).toHaveLength(3);

    const ol = root.querySelector('ol');
    expect(ol).not.toHaveAttribute('start');
    expect(ol?.querySelector('ul')).not.toBeNull();

    const tasks = root.querySelectorAll<HTMLInputElement>('li input[type=checkbox]');
    expect([...tasks].map(t => t.checked)).toEqual([true, false]);
    expect(tasks[0]).toHaveClass('sr-only');
    expect(tasks[0]).toBeDisabled();
    const marks = root.querySelectorAll('li.list-none > [data-state]');
    expect([...marks].map(m => m.getAttribute('data-state'))).toEqual(['checked', 'unchecked']);

    expect(root.querySelector('blockquote')).toHaveTextContent('Rules apply within 1 minute.');
    expect(screen.getByRole('separator')).toBeInTheDocument();

    const links = screen.getAllByTestId('m--link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute(
      'href',
      'https://docs.wallarm.com/admin-en/configure-parameters-en/',
    );
    expect(links[0]).toHaveAttribute('target', '_blank');
    expect(links[0]).toHaveAttribute('rel', 'noopener noreferrer');
    expect(links[1]).toHaveAttribute('href', 'https://console.wallarm.com');

    const block = screen.getByTestId('m--code-block');
    expect(block).toHaveTextContent('"action": "block"');
    expect(block.closest('[data-slot=assistant-message-markdown-code-block]')).not.toBeNull();
    expect(screen.getByTestId('m--code-block--copy-button')).toBeInTheDocument();
  });

  it('starts an ordered list at its first number', () => {
    renderMd('3. three\n4. four');
    expect(content().querySelector('ol')).toHaveAttribute('start', '3');
  });

  it('right-aligns every cell of an unaligned table, headers included', () => {
    renderMd('| IP | Hits |\n| --- | --- |\n| 1.2.3.4 | 120 |');
    const cells = content().querySelectorAll('th, td');
    expect(cells).toHaveLength(4);
    for (const cell of cells) expect(cell).toHaveClass('text-right');
  });

  it('renders the blocks without a wrapper element', () => {
    renderMd('a\n\nb');
    expect([...content().children].map(c => c.tagName)).toEqual(['P', 'P']);
  });
});

describe('AssistantMessageMarkdown — streaming snapshots', () => {
  it.each([
    [
      't1',
      STREAMING_SNAPSHOTS.t1,
      '<p>Looking at hits for <code data-slot="inline-code-snippet" data-testid="m--inline-code">/api/lo</code></p>',
    ],
    ['t4', STREAMING_SNAPSHOTS.t4, '<p>Found <strong>3 att</strong></p>'],
    ['t4b', STREAMING_SNAPSHOTS.t4b, '<p>Found</p>'],
    ['t5', STREAMING_SNAPSHOTS.t5, '<p>Found:</p>'],
    ['t7', STREAMING_SNAPSHOTS.t7, '<p>See docs</p>'],
  ])('%s renders the partial snapshot', (id, text, html) => {
    renderMd(text, { streaming: true, variant: id === 't1' ? 'chain-of-thought' : 'answer' });
    expect(markup()).toBe(html);
  });

  it('t5c shows the table with one row and an empty last cell', () => {
    renderMd(STREAMING_SNAPSHOTS.t5c, { streaming: true });
    const cells = [...screen.getByTestId('m--table').querySelectorAll('tbody td')];
    expect(cells.map(c => c.textContent)).toEqual(['1.2.3.4', 'sq', '']);
  });

  it('t6 keeps the open fence plain and without a copy button', () => {
    renderMd(STREAMING_SNAPSHOTS.t6, { streaming: true });
    expect(content().querySelector('ol')).toHaveAttribute('start', '2');
    expect(screen.getByTestId('m--code-block')).toHaveTextContent('rule: block');
    expect(screen.queryByTestId('m--code-block--copy-button')).toBeNull();
  });

  it('t6b holds back a fence with no code yet', () => {
    renderMd(STREAMING_SNAPSHOTS.t6b, { streaming: true });
    expect(screen.queryByTestId('m--code-block')).toBeNull();
    expect(content().querySelector('ol')).toHaveTextContent('Add a rule:');
  });

  it('repairs nothing once streaming is off', () => {
    renderMd(STREAMING_SNAPSHOTS.t4);
    expect(markup()).toBe('<p>Found **3 att</p>');
  });

  it('never flashes markers or empty blocks over every prefix of an answer', () => {
    const { rerender } = renderMd('', { streaming: true });
    for (let n = 1; n <= WALLY_ANSWER.length; n++) {
      rerender(
        <AssistantMessage data-testid='m'>
          <AssistantMessageContent>
            <AssistantMessageMarkdown text={WALLY_ANSWER.slice(0, n)} streaming />
          </AssistantMessageContent>
        </AssistantMessage>,
      );
      const clone = content().cloneNode(true) as HTMLElement;
      for (const code of clone.querySelectorAll('code, pre, [data-testid="m--code-block"]'))
        code.remove();
      expect(clone.textContent, `prefix ${n}`).not.toMatch(/\*\*|`|\||\[[ x]\]/);
      for (const el of content().querySelectorAll('h1, h2, h3, h4, h5, h6, p, blockquote'))
        expect(el.textContent?.trim(), `prefix ${n}: empty <${el.tagName}>`).not.toBe('');
      for (const block of screen.queryAllByTestId('m--code-block'))
        expect(block.textContent?.trim(), `prefix ${n}: empty code block`).not.toBe('');
    }
  });
});

const h2Renders = rs.fn();
const quoteRenders = rs.fn();
const COUNTING: Partial<AssistantMessageMarkdownComponents> = {
  h2: ({ children }) => {
    h2Renders();
    return <h2>{children}</h2>;
  },
  blockquote: ({ children }) => {
    quoteRenders();
    return <blockquote>{children}</blockquote>;
  },
};

const codeBlockSpy = rs.fn();
const SPY_CODE_BLOCK: Partial<AssistantMessageMarkdownComponents> = {
  codeBlock: (props: AssistantMessageMarkdownCodeBlockProps) => {
    codeBlockSpy(props.complete);
    return <AssistantMessageMarkdownCodeBlock {...props} />;
  },
};

describe('AssistantMessageMarkdown — memoization', () => {
  it('renders a finished block only while it is the tail, plus once when streaming ends', () => {
    const headingEnd = WALLY_ANSWER.indexOf('\n');
    const at = (n: number, streaming: boolean) => (
      <AssistantMessageMarkdown
        text={WALLY_ANSWER.slice(0, n)}
        streaming={streaming}
        components={COUNTING}
      />
    );
    const { rerender } = render(at(1, true));
    let frames = 0;
    let tailFrames = 0;
    for (let n = 2; n <= WALLY_ANSWER.length; n += 2) {
      rerender(at(n, true));
      frames++;
      // Lexed as a lone block, the heading is still the tail (an h2 appears from the 3rd char on).
      if (n <= headingEnd + 2) tailFrames++;
    }
    expect(frames).toBeGreaterThan(200);
    const during = h2Renders.mock.calls.length;
    expect(during).toBeLessThanOrEqual(tailFrames + 1);
    expect(quoteRenders.mock.calls.length).toBeLessThan(20);
    rerender(at(WALLY_ANSWER.length, false));
    expect(h2Renders.mock.calls.length).toBe(during + 1);
  });

  it('hands codeBlock complete=false until the fence closes', () => {
    const open = 'Run:\n\n```json\n{"a": 1}';
    const { rerender } = render(
      <AssistantMessage data-testid='m'>
        <AssistantMessageMarkdown text={open} streaming components={SPY_CODE_BLOCK} />
      </AssistantMessage>,
    );
    expect(codeBlockSpy).toHaveBeenLastCalledWith(false);
    expect(screen.queryByTestId('m--code-block--copy-button')).toBeNull();
    rerender(
      <AssistantMessage data-testid='m'>
        <AssistantMessageMarkdown text={`${open}\n\`\`\``} streaming components={SPY_CODE_BLOCK} />
      </AssistantMessage>,
    );
    expect(codeBlockSpy).toHaveBeenLastCalledWith(true);
    expect(screen.getByTestId('m--code-block--copy-button')).toBeInTheDocument();
  });
});

describe('AssistantMessageMarkdown — variants', () => {
  it('chain-of-thought mutes inline code, turns copy off and shrinks links', () => {
    renderMd('See `x` and [docs](https://a.example)', { variant: 'chain-of-thought' });
    const chip = screen.getByTestId('m--inline-code');
    expect(chip).not.toHaveAttribute('data-ds-suppress-parent-click');
    expect(chip).toHaveClass('text-text-secondary');
    expect(screen.getByTestId('m--link')).toHaveClass('text-xs');
  });

  it('approval renders like answer', () => {
    renderMd('Run `x`', { variant: 'approval' });
    expect(screen.getByTestId('m--inline-code')).toHaveAttribute(
      'data-ds-suppress-parent-click',
      '',
    );
  });

  it('inline code inside a link is not copyable', () => {
    renderMd('[`x`](https://a.example)');
    const chip = screen.getByTestId('m--inline-code');
    expect(chip.closest('a')).toBe(screen.getByTestId('m--link'));
    expect(chip).not.toHaveAttribute('data-ds-suppress-parent-click');
  });
});

describe('AssistantMessageMarkdown — untrusted content', () => {
  it.each([
    '[a](javascript:alert(1))',
    '[a](JaVaScRiPt:alert(1))',
    '[a](data:text/html,<script>alert(1)</script>)',
    '[a](vbscript:msgbox(1))',
    '<javascript:alert(1)>',
    '[l](<javascript:alert(1)>)',
    '[e](javascript&colon;alert(1))',
    '[b](&#106;avascript:alert(1))',
    '[f](file:///etc/passwd)',
    '[b](blob:https://a.example/1)',
    '![k](javascript:alert(1))',
    '![p](https://evil.example/p.gif)',
    '<script>alert(1)</script>',
    '<img src=x onerror=alert(1)>',
    '<a href="javascript:alert(1)">x</a>',
    '<iframe src="https://evil.example"></iframe>',
    HOSTILE,
  ])('renders %j inert', text => {
    renderMd(text);
    const root = content();
    expect(root.querySelector('script, img, iframe, [onerror]')).toBeNull();
    for (const a of root.querySelectorAll('a[href]'))
      expect(safeHref(a.getAttribute('href'))).toBe(a.getAttribute('href'));
  });

  it('shows raw HTML as text and keeps the alt of a blocked image', () => {
    renderMd(HOSTILE);
    const root = content();
    expect(root).toHaveTextContent('<script>alert(1)</script>');
    expect(root).toHaveTextContent('<img src=x onerror=alert(1)>');
    expect(root).toHaveTextContent('a pixel pixel');
    expect(root.querySelectorAll('a')).toHaveLength(1); // only the harmless relative `javascript&colon;…`
  });

  it('turns a bare <br> in a table cell into a line break', () => {
    renderMd('| a |\n|---|\n| x<br>y |');
    expect(screen.getByTestId('m--table').querySelector('td br')).not.toBeNull();
  });
});

const linkSpy = rs.fn();
const imgSpy = rs.fn();
const OVERRIDES: Partial<AssistantMessageMarkdownComponents> = {
  a: props => {
    linkSpy(props);
    return <AssistantMessageMarkdownLink {...props} data-analytics-id='wally.answer.link' />;
  },
  img: ({ src, alt }) => {
    imgSpy(src);
    return <img src={src} alt={alt} />;
  },
};

describe('AssistantMessageMarkdown — overrides', () => {
  it('hands overrides the allow-listed props and keeps the other defaults', () => {
    renderMd(
      '[docs](https://a.example) `x` ![a](javascript:alert(1)) ![b](https://img.example/b.png)',
      {
        variant: 'answer',
        components: OVERRIDES,
      },
    );
    const props = linkSpy.mock.lastCall?.[0] as {
      href: string;
      variant: string;
      children: ReactNode;
    };
    expect(props.href).toBe('https://a.example');
    expect(props.variant).toBe('answer');
    expect(screen.getByTestId('m--link')).toHaveAttribute('data-analytics-id', 'wally.answer.link');
    expect(screen.getByTestId('m--link')).toHaveTextContent('docs');
    expect(screen.getByTestId('m--inline-code')).toHaveAttribute(
      'data-slot',
      'inline-code-snippet',
    );
    expect(imgSpy.mock.calls).toEqual([['https://img.example/b.png']]);
    expect(content().querySelectorAll('img')).toHaveLength(1);
  });
});

describe('AssistantMessageMarkdown — parts', () => {
  it('forwards refs and lets a consumer test id replace the slot id', () => {
    const block = createRef<HTMLDivElement>();
    const table = createRef<HTMLDivElement>();
    const link = createRef<HTMLAnchorElement>();
    const code = createRef<HTMLElement>();
    render(
      <AssistantMessage data-testid='m'>
        <AssistantMessageMarkdownCodeBlock ref={block} code='x' data-testid='my-block' />
        <AssistantMessageMarkdownTable ref={table} data-testid='my-table'>
          <tbody />
        </AssistantMessageMarkdownTable>
        <AssistantMessageMarkdownLink ref={link} href='/x' data-testid='my-link'>
          x
        </AssistantMessageMarkdownLink>
        <AssistantMessageMarkdownInlineCode
          ref={code}
          code='y'
          copyable={false}
          data-testid='my-code'
        />
      </AssistantMessage>,
    );
    expect(block.current).toHaveAttribute('data-slot', 'assistant-message-markdown-code-block');
    expect(screen.getByTestId('my-block--copy-button')).toBeInTheDocument();
    expect(table.current).toBe(screen.getByTestId('my-table'));
    expect(link.current).toBe(screen.getByTestId('my-link'));
    expect(link.current).not.toHaveAttribute('target');
    expect(code.current).toBe(screen.getByTestId('my-code'));
  });
});
