import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
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

const renderOverflowPopover = (items: string[]) => (
  <Popover>
    <PopoverTrigger asChild>
      <Tag>+{items.length}</Tag>
    </PopoverTrigger>
    <PopoverContent minWidth='auto' minHeight='auto' maxWidth='240px'>
      <div className='flex flex-col gap-4'>
        {items.map(item => (
          <Tag key={item}>{item}</Tag>
        ))}
      </div>
    </PopoverContent>
  </Popover>
);

/** All nine tags fit in 640px, so the overflow renderer is never called at all. */
export const Basic: StoryFn = () => (
  <div className='w-640'>
    <OverflowList
      className='gap-4'
      items={TAGS}
      itemRenderer={item => <Tag key={item}>{item}</Tag>}
      overflowRenderer={renderOverflowPopover}
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
      overflowRenderer={renderOverflowPopover}
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
      overflowRenderer={renderOverflowPopover}
    />
  </div>
);

/** Overflow popover that lays hidden items out in a single row. */
const renderOverflowPopoverInline = (items: string[]) => (
  <Popover>
    <PopoverTrigger asChild>
      <Tag>+{items.length}</Tag>
    </PopoverTrigger>
    <PopoverContent minWidth='auto' minHeight='auto' maxWidth='unset'>
      <div className='flex flex-row flex-nowrap gap-4'>
        {items.map(item => (
          <Tag key={item}>{item}</Tag>
        ))}
      </div>
    </PopoverContent>
  </Popover>
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
      overflowRenderer={renderOverflowPopoverInline}
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
      overflowRenderer={renderOverflowPopover}
    />
  </div>
);
