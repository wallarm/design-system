// markdown blocks and spans are positional; while streaming only the tail changes
import { type ComponentType, type FC, Fragment, memo, type ReactNode } from 'react';

import type { MarkedToken, Token } from 'marked';

import { cn } from '../../utils/cn';
import { Checkmark } from '../Checkmark';
import { Separator } from '../Separator';
import { tableBodyCellVariants, tableHeadCellVariants } from '../Table/classes';
import {
  AssistantMessageMarkdownCodeBlock,
  type AssistantMessageMarkdownCodeBlockProps,
} from './AssistantMessageMarkdownCodeBlock';
import {
  AssistantMessageMarkdownInlineCode,
  type AssistantMessageMarkdownInlineCodeProps,
} from './AssistantMessageMarkdownInlineCode';
import {
  AssistantMessageMarkdownLink,
  type AssistantMessageMarkdownLinkProps,
} from './AssistantMessageMarkdownLink';
import { AssistantMessageMarkdownTable } from './AssistantMessageMarkdownTable';
import {
  assistantMessageMarkdownBlockquoteVariants,
  assistantMessageMarkdownCellVariants,
  assistantMessageMarkdownListVariants,
  assistantMessageMarkdownTaskItemVariants,
} from './classes';
import { asTokens, decodeEntities, isClosedFence, lexMarkdown, safeHref } from './lib/markdown';

/** Same literals as `ChatMarkdownProps.variant`. 'approval' renders like 'answer'. */
export type AssistantMessageMarkdownVariant = 'answer' | 'chain-of-thought' | 'approval';
type Align = 'left' | 'center' | 'right';
interface WithChildren {
  children?: ReactNode;
}

/** One entry per element. The renderer passes only these props; `href` and `src` are already allow-listed. */
export interface AssistantMessageMarkdownComponents {
  p: ComponentType<WithChildren>;
  h1: ComponentType<WithChildren>;
  h2: ComponentType<WithChildren>;
  h3: ComponentType<WithChildren>;
  h4: ComponentType<WithChildren>;
  h5: ComponentType<WithChildren>;
  h6: ComponentType<WithChildren>;
  strong: ComponentType<WithChildren>;
  em: ComponentType<WithChildren>;
  del: ComponentType<WithChildren>;
  blockquote: ComponentType<WithChildren>;
  ul: ComponentType<WithChildren>;
  ol: ComponentType<WithChildren & { start?: number }>;
  /** `checked` is set for GFM task items only. */
  li: ComponentType<WithChildren & { checked?: boolean }>;
  hr: ComponentType;
  table: ComponentType<WithChildren>;
  thead: ComponentType<WithChildren>;
  tbody: ComponentType<WithChildren>;
  tr: ComponentType<WithChildren>;
  th: ComponentType<WithChildren & { align?: Align }>;
  td: ComponentType<WithChildren & { align?: Align }>;
  a: ComponentType<AssistantMessageMarkdownLinkProps>;
  inlineCode: ComponentType<AssistantMessageMarkdownInlineCodeProps>;
  codeBlock: ComponentType<AssistantMessageMarkdownCodeBlockProps>;
  /** Default: the alt text. An untrusted image URL loads on render (tracking pixel, data exfiltration). */
  img: ComponentType<{ src: string; alt: string; title?: string }>;
}

export interface AssistantMessageMarkdownProps {
  /** Untrusted GFM: the whole text so far (a snapshot, never a delta). */
  text: string;
  /** The text is still growing: repair the unfinished last block, hold back a half-typed table or an empty fence,
   *  keep an open fence unhighlighted. Default false. */
  streaming?: boolean;
  /** Where it renders. 'chain-of-thought': muted, non-copyable inline code and 12px links. Default 'answer'. */
  variant?: AssistantMessageMarkdownVariant;
  /** Element overrides merged over the defaults. Module scope: a new object re-renders every block. */
  components?: Partial<AssistantMessageMarkdownComponents>;
}

const HEADINGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
const cell = (base: string, align: Align | undefined) =>
  cn(base, assistantMessageMarkdownCellVariants({ align }));

const DEFAULTS: AssistantMessageMarkdownComponents = {
  p: ({ children }) => <p>{children}</p>,
  h1: ({ children }) => <h1>{children}</h1>,
  h2: ({ children }) => <h2>{children}</h2>,
  h3: ({ children }) => <h3>{children}</h3>,
  h4: ({ children }) => <h4>{children}</h4>,
  h5: ({ children }) => <h5>{children}</h5>,
  h6: ({ children }) => <h6>{children}</h6>,
  strong: ({ children }) => <strong className='font-semibold'>{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  del: ({ children }) => <del>{children}</del>,
  blockquote: ({ children }) => (
    <blockquote className={assistantMessageMarkdownBlockquoteVariants()}>{children}</blockquote>
  ),
  ul: ({ children }) => <ul className={assistantMessageMarkdownListVariants()}>{children}</ul>,
  ol: ({ start, children }) => (
    <ol start={start} className={assistantMessageMarkdownListVariants({ ordered: true })}>
      {children}
    </ol>
  ),
  li: ({ checked, children }) =>
    checked === undefined ? (
      <li>{children}</li>
    ) : (
      <li className={assistantMessageMarkdownTaskItemVariants()}>
        <input type='checkbox' checked={checked} disabled readOnly className='sr-only' />
        <Checkmark checkedState={checked} aria-hidden='true' />
        <div className='min-w-0'>{children}</div>
      </li>
    ),
  hr: () => <Separator decorative={false} />,
  table: AssistantMessageMarkdownTable,
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ align, children }) => (
    <th scope='col' className={cell(tableHeadCellVariants(), align)}>
      {children}
    </th>
  ),
  td: ({ align, children }) => <td className={cell(tableBodyCellVariants(), align)}>{children}</td>,
  a: AssistantMessageMarkdownLink,
  inlineCode: AssistantMessageMarkdownInlineCode,
  codeBlock: AssistantMessageMarkdownCodeBlock,
  img: ({ alt }) => alt,
};

interface Walk {
  c: AssistantMessageMarkdownComponents;
  variant: AssistantMessageMarkdownVariant;
  streaming: boolean;
  /** Inside a link: inline code must not become a second interactive target. */
  inLink: boolean;
}

const renderInline = (tokens: Token[] | undefined, w: Walk): ReactNode[] =>
  asTokens(tokens).map((t, i) => {
    const { c } = w;
    switch (t.type) {
      case 'text':
        return t.tokens ? (
          <Fragment key={i}>{renderInline(t.tokens, w)}</Fragment>
        ) : (
          decodeEntities(t.text)
        );
      case 'escape':
        return t.text;
      case 'strong':
        return <c.strong key={i}>{renderInline(t.tokens, w)}</c.strong>;
      case 'em':
        return <c.em key={i}>{renderInline(t.tokens, w)}</c.em>;
      case 'del':
        return <c.del key={i}>{renderInline(t.tokens, w)}</c.del>;
      case 'codespan':
        return (
          <c.inlineCode
            key={i}
            code={t.text}
            variant={w.variant}
            copyable={!w.inLink && w.variant !== 'chain-of-thought'}
          />
        );
      case 'br':
        return <br key={i} />;
      case 'link': {
        const href = safeHref(t.href);
        const children = renderInline(t.tokens, { ...w, inLink: true });
        return href ? (
          <c.a key={i} href={href} title={t.title ?? undefined} variant={w.variant}>
            {children}
          </c.a>
        ) : (
          <Fragment key={i}>{children}</Fragment>
        );
      }
      case 'image': {
        const src = safeHref(t.href);
        return src ? <c.img key={i} src={src} alt={t.text} title={t.title ?? undefined} /> : t.text;
      }
      case 'html': // raw HTML shows as typed; only a bare <br> (LLMs put it in table cells) breaks the line
        return /^<br\s*\/?>$/i.test(t.raw) ? <br key={i} /> : t.raw;
      case 'checkbox':
        return null;
      default:
        return t.raw;
    }
  });

const renderBlocks = (tokens: Token[] | undefined, w: Walk): ReactNode[] =>
  asTokens(tokens).map((t, i) => renderBlock(t, i, w));

const renderBlock = (t: MarkedToken, key: number, w: Walk): ReactNode => {
  const { c } = w;
  switch (t.type) {
    case 'paragraph':
      return <c.p key={key}>{renderInline(t.tokens, w)}</c.p>;
    case 'text': // a tight list item's line
      return (
        <Fragment key={key}>
          {t.tokens ? renderInline(t.tokens, w) : decodeEntities(t.text)}
        </Fragment>
      );
    case 'heading': {
      const H = c[HEADINGS[t.depth - 1] ?? 'h6'];
      return <H key={key}>{renderInline(t.tokens, w)}</H>;
    }
    case 'code':
      return (
        <c.codeBlock
          key={key}
          code={t.text}
          language={t.lang || undefined}
          complete={!w.streaming || isClosedFence(t.raw)}
        />
      );
    case 'blockquote':
      return <c.blockquote key={key}>{renderBlocks(t.tokens, w)}</c.blockquote>;
    case 'list': {
      const items = t.items.map((item, j) => (
        <c.li key={j} checked={item.task ? item.checked : undefined}>
          {renderBlocks(item.tokens, w)}
        </c.li>
      ));
      return t.ordered ? (
        <c.ol key={key} start={t.start === '' || t.start === 1 ? undefined : t.start}>
          {items}
        </c.ol>
      ) : (
        <c.ul key={key}>{items}</c.ul>
      );
    }
    case 'table':
      return (
        <c.table key={key}>
          <c.thead>
            <c.tr>
              {t.header.map((h, j) => (
                <c.th key={j} align={h.align ?? undefined}>
                  {renderInline(h.tokens, w)}
                </c.th>
              ))}
            </c.tr>
          </c.thead>
          <c.tbody>
            {t.rows.map((row, j) => (
              <c.tr key={j}>
                {row.map((d, k) => (
                  <c.td key={k} align={d.align ?? undefined}>
                    {renderInline(d.tokens, w)}
                  </c.td>
                ))}
              </c.tr>
            ))}
          </c.tbody>
        </c.table>
      );
    case 'hr':
      return <c.hr key={key} />;
    case 'html': // a raw HTML block shows as typed
      return t.raw.trim() ? <c.p key={key}>{t.raw.trim()}</c.p> : null;
    case 'space':
    case 'def':
    case 'checkbox':
      return null;
    default:
      return <c.p key={key}>{t.raw}</c.p>;
  }
};

interface BlockProps {
  token: MarkedToken;
  streaming: boolean;
  variant: AssistantMessageMarkdownVariant;
  components?: Partial<AssistantMessageMarkdownComponents>;
}

/**
 * One top-level block. Every lex makes new token objects, so it compares the block's source: finished blocks skip
 * rendering while the tail streams, and every block renders once more when `streaming` ends (a reference-link
 * definition that arrived after its use resolves then).
 */
const Block = memo<BlockProps>(
  ({ token, streaming, variant, components }) =>
    renderBlock(token, 0, {
      c: components ? { ...DEFAULTS, ...components } : DEFAULTS,
      variant,
      streaming,
      inLink: false,
    }),
  (a, b) =>
    a.token.raw === b.token.raw &&
    a.streaming === b.streaming &&
    a.variant === b.variant &&
    a.components === b.components,
);
Block.displayName = 'AssistantMessageMarkdownBlock';

/**
 * Untrusted GFM (an AG-UI `AssistantMessage.content` snapshot) as DS elements. It renders no wrapper: its blocks
 * are direct children of `AssistantMessageContent`, a `ChainOfThoughtStep` body or `ApprovalCardContent`, which
 * space and style them. No raw HTML, http/https/mailto/relative links only, no images. The default
 * `ChatViewConfig.markdown`; its props are a subset of `ChatMarkdownProps`.
 */
export const AssistantMessageMarkdown: FC<AssistantMessageMarkdownProps> = ({
  text,
  streaming = false,
  variant = 'answer',
  components,
}) =>
  lexMarkdown(text, streaming).map((token, i) => (
    <Block key={i} token={token} streaming={streaming} variant={variant} components={components} />
  ));

AssistantMessageMarkdown.displayName = 'AssistantMessageMarkdown';
