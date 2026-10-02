import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Tag } from '../Tag';
import { OverflowList } from './OverflowList';

const DESCRIPTION = [
  'Lays a set of items out in one row and folds whatever will not fit into an overflow control — reach for `OverflowTooltip` instead when the thing overrunning is a single run of text rather than a set.',
  'It renders nothing of its own: both the item and the `+N` are your renderers, so the popover behind the count is your composition, and it re-measures whenever the container changes width.',
].join(' ');

const meta = {
  title: 'Data Display/OverflowList',
  component: OverflowList,
  parameters: {
    layout: 'padded',
    docs: { description: { component: DESCRIPTION } },
  },
} satisfies Meta<typeof OverflowList<string>>;

export default meta;

const TAGS = ['XSS', 'BOLA', 'SQL Injection', 'Scanner', 'CSRF', 'XXE', 'RCE', 'LFI', 'IDOR'];

/** All nine tags fit in 640px, so the overflow renderer is never called at all. */
export const Basic: StoryFn = () => (
  <div className='w-640'>
    <OverflowList
      className='gap-4'
      items={TAGS}
      itemRenderer={item => <Tag key={item}>{item}</Tag>}
      overflowHeaderLabel='tags'
    />
  </div>
);

/** The same nine in 200px: two survive and the `+N` takes the rest, which is the whole job. */
export const Collapsed: StoryFn = () => (
  <div className='w-200'>
    <OverflowList
      className='gap-4'
      items={TAGS}
      itemRenderer={item => <Tag key={item}>{item}</Tag>}
      overflowHeaderLabel='tags'
    />
  </div>
);

/**
 * `collapseFrom='start'` hides the beginning and keeps the end in view — for a path or a
 * history where the most recent items are the ones that matter.
 */
export const CollapseFromStart: StoryFn = () => (
  <div className='w-240'>
    <OverflowList
      className='gap-4'
      collapseFrom='start'
      items={TAGS}
      itemRenderer={item => <Tag key={item}>{item}</Tag>}
      overflowHeaderLabel='tags'
    />
  </div>
);

/**
 * `minVisibleItems` puts a floor under the measurement: however tight the column gets,
 * that many items stay and the rest go to the `+N` rather than the row emptying out.
 */
export const MinVisibleItems: StoryFn = () => (
  <div className='w-160 overflow-hidden rounded-2 border border-border-primary p-12'>
    <OverflowList
      className='gap-4'
      minVisibleItems={1}
      items={TAGS}
      itemRenderer={item => <Tag key={item}>{item}</Tag>}
      overflowHeaderLabel='tags'
    />
  </div>
);

/**
 * Drag the box's right edge: the split is re-measured as the width changes rather than at
 * breakpoints, which is what makes it safe inside a resizable panel.
 */
export const ResizableContainer: StoryFn = () => (
  <div
    data-testid='resizable-wrapper'
    className='overflow-hidden rounded-2 border border-border-primary p-12'
    style={{ width: 500, minWidth: 80, maxWidth: 800, resize: 'horizontal' }}
  >
    <OverflowList
      className='gap-4'
      items={TAGS}
      itemRenderer={item => <Tag key={item}>{item}</Tag>}
      overflowHeaderLabel='tags'
    />
  </div>
);

const ATTACK_TYPES = ['RCE', 'XSS', 'SQL Injection', 'CSRF'];

/**
 * Shows all items (visible + hidden) in the popover with a total count header.
 * This is the recommended pattern for read-only contexts.
 *
 * @see docs/chip-overflow-pattern.md
 */
export const ShowAllInPopover: StoryFn = () => (
  <div className='w-120'>
    <OverflowList
      className='gap-4'
      items={ATTACK_TYPES}
      itemRenderer={item => <Tag key={item}>{item}</Tag>}
      overflowHeaderLabel='attack types'
      showAll
    />
  </div>
);

/**
 * Shows only hidden items in the popover (legacy pattern).
 * Use only for editable contexts like multi-select inputs.
 */
export const HiddenOnlyInPopover: StoryFn = () => (
  <div className='w-120'>
    <OverflowList
      className='gap-4'
      items={ATTACK_TYPES}
      itemRenderer={item => <Tag key={item}>{item}</Tag>}
      showAll={false}
    />
  </div>
);

/**
 * Popover overlays the origin (visible items + trigger).
 * Use when the popover should cover the entire row.
 */
export const OverlayOrigin: StoryFn = () => (
  <div className='w-120'>
    <OverflowList
      className='gap-4'
      items={ATTACK_TYPES}
      itemRenderer={item => <Tag key={item}>{item}</Tag>}
      overflowHeaderLabel='attack types'
      showAll
      overlayOrigin
    />
  </div>
);
