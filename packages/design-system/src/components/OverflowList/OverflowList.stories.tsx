import { useState } from 'react';
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

/**
 * Guaranteed minimum number of visible items. The container is deliberately
 * narrow: `minVisibleItems={1}` keeps at least one tag visible (the rest
 * collapse into "+N") even when the space is tight.
 */
export const MinVisibleItems: StoryFn = () => (
  <div className='w-160 overflow-hidden rounded-2 border border-border-primary p-12'>
    <OverflowList
      className='gap-4'
      minVisibleItems={1}
      items={TAGS}
      itemRenderer={item => (
        <Tag key={item} className='shrink-0 whitespace-nowrap'>
          {item}
        </Tag>
      )}
      overflowRenderer={renderOverflowPopoverInline}
    />
  </div>
);

/**
 * Reproduces the keep-alive `display:none` regression. Visibility is toggled via
 * the DOM (not React state) so showing the list does NOT re-render it — exactly
 * like the keep-alive tab switch, where only a `className` flips and the
 * ResizeObserver, not a React render, drives the reflow. The "rerender" button
 * forces a re-measure while hidden (at zero width). After hide → rerender →
 * show, the list must stay collapsed, not expand to every item and overflow.
 */
export const HiddenRemeasure: StoryFn = () => {
  const [, setTick] = useState(0);
  return (
    <div className='flex flex-col gap-12'>
      <button type='button' data-testid='force-rerender' onClick={() => setTick(t => t + 1)}>
        rerender
      </button>
      <div data-testid='hide-wrapper' className='w-200'>
        <OverflowList
          className='gap-4'
          items={TAGS}
          // Intentionally inline (not hoisted): the fresh identity each render
          // defeats OverflowList's memo on the "rerender" click, so the layout
          // effect re-runs while hidden and flags a pending re-measure — the
          // exact condition the e2e exercises. Hoisting this would silently
          // neuter the regression test.
          itemRenderer={item => <Tag key={item}>{item}</Tag>}
          overflowRenderer={renderOverflowPopover}
        />
      </div>
    </div>
  );
};

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
