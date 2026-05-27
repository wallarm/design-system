import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { Tag } from '../Tag';
import { OverflowList } from './OverflowList';

const meta = {
  title: 'Data Display/OverflowList',
  component: OverflowList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Renders a horizontal list of items and collapses the ones that do not fit into a ' +
          '"+N" overflow indicator. Reflows efficiently when its container is resized.',
      },
    },
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

/** Basic list — all items fit in a wide container. */
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

/** Narrow container — most items collapse into "+N". */
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

/** Collapse from the start of the list. */
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
          <Tag key={item} className='shrink-0 whitespace-nowrap'>
            {item}
          </Tag>
        ))}
      </div>
    </PopoverContent>
  </Popover>
);

/** Guaranteed minimum number of visible items. */
export const MinVisibleItems: StoryFn = () => (
  <div className='w-160'>
    <OverflowList
      className='gap-4'
      minVisibleItems={3}
      items={TAGS}
      itemRenderer={item => <Tag key={item}>{item}</Tag>}
      overflowRenderer={renderOverflowPopoverInline}
    />
  </div>
);

/**
 * Resizable container: drag the bottom-right corner of the box to see the list
 * reflow live. The data-testid is used by E2E to resize programmatically.
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
