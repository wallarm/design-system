import { cva } from 'class-variance-authority';

/** Chain of thought / approval card → next part is 12px (4 gap + 8 margin); answer → actions
 * is 4px. The approval card stretches to the full width (the root is `items-start`). The
 * actions row is pulled 4px left so the 24px button's icon lines up with the text. */
export const assistantMessageVariants = cva(
  'group/message flex flex-col items-start gap-4 px-8 [&>[data-slot=approval-card]]:mb-8 [&>[data-slot=approval-card]]:self-stretch [&>[data-slot=chain-of-thought]]:mb-8 [&>[data-slot=message-actions]]:-ms-4',
);

/** Prose for markdown blocks (`AssistantMessageMarkdown` or your renderer): paragraphs 14/24, headings 16/24
 * medium, lists 14/20 indented 21px. */
export const assistantMessageContentVariants = cva(
  'self-stretch text-sm leading-base break-words text-text-primary [&_:is(h1,h2,h3,h4,h5,h6)]:font-sans-display [&_:is(h1,h2,h3,h4,h5,h6)]:text-base [&_:is(h1,h2,h3,h4,h5,h6)]:font-medium [&_:is(ul,ol)]:ps-21 [&_li]:leading-sm [&_li+li]:mt-4 [&_ol]:list-decimal [&_ul]:list-disc [&>*+*]:mt-8 [&>:is(h1,h2,h3,h4,h5,h6)+*]:mt-4',
);

/** The Figma "Working..." row (469:341): the ChainOfThought icon cell and shimmering label, without list semantics. */
export const assistantMessageLoaderVariants = cva(
  'flex items-start gap-6 self-stretch text-xs leading-xs text-text-secondary',
);

/** Not in Figma yet (flagged for design review): danger text with a leading OctagonAlert and a trailing action.
 * The action (children after the icon and text) is pulled 2px up and down so a 24px Button centres on
 * the first 20px text line instead of growing the row; `items-start` keeps multi-line text top-aligned. */
export const assistantMessageErrorVariants = cva(
  'flex items-start gap-8 self-stretch text-sm text-text-danger [&>:nth-child(n+3)]:-my-2',
);

/** Not in Figma (provisional): a muted rule on the start edge. */
export const assistantMessageMarkdownBlockquoteVariants = cva(
  'border-s-2 border-border-primary ps-12 text-text-secondary [&>*+*]:mt-8',
);

/** Lists carry their own markers: the chain-of-thought body only styles `ul` (its nested chains are `ol`s) and
 *  ApprovalCardContent styles none. 18px = the CoT indent; AssistantMessageContent's `ps-21` wins in answers. */
export const assistantMessageMarkdownListVariants = cva('ps-18', {
  variants: { ordered: { true: 'list-decimal', false: 'list-disc' } },
  defaultVariants: { ordered: false },
});

/** GFM task item: the Checkmark takes the bullet's place (provisional). */
export const assistantMessageMarkdownTaskItemVariants = cva('flex list-none items-start gap-8');

/** GFM column alignment. Unaligned columns, headers included, sit at the end (user decision). */
export const assistantMessageMarkdownCellVariants = cva('', {
  variants: { align: { left: 'text-left', center: 'text-center', right: 'text-right' } },
  defaultVariants: { align: 'right' },
});

/** Long hashes and tokens wrap instead of overflowing the 444px column; muted in the chain of thought
 *  (Figma 494:4292: color → text-secondary). */
export const assistantMessageMarkdownInlineCodeVariants = cva('max-w-full wrap-anywhere', {
  variants: { muted: { true: 'text-text-secondary', false: '' } },
  defaultVariants: { muted: false },
});

/** `Link` is inline-flex (a long link wouldn't wrap) and has outline-none with no ring. */
export const assistantMessageMarkdownLinkVariants = cva(
  'inline rounded-2 focus-visible:ring-3 focus-visible:ring-focus-primary',
);

/** A real block for the prose margins (CodeSnippetRoot's outer node is display: contents). */
export const assistantMessageMarkdownCodeBlockVariants = cva('[li>&]:mt-4');

/** Scrolls sideways in the narrow panel; the frame is `tableContainerVariants`. */
export const assistantMessageMarkdownTableVariants = cva('overflow-x-auto');
export const assistantMessageMarkdownTableGridVariants = cva(
  'w-full border-separate border-spacing-0 [&>tbody>tr:last-child>td]:border-b-0',
);
