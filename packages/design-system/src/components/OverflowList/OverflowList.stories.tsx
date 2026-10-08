import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Tag } from '../Tag';
import { OverflowList } from './OverflowList';
import { OverflowListMore } from './OverflowListMore';
import { OverflowListMoreContent } from './OverflowListMoreContent';
import { OverflowListMoreCount } from './OverflowListMoreCount';
import { OverflowListMoreHeader } from './OverflowListMoreHeader';
import { OverflowListMoreItems } from './OverflowListMoreItems';
import { OverflowListMoreTrigger } from './OverflowListMoreTrigger';
import { useOverflowListMore } from './useOverflowListMore';

const DESCRIPTION = [
  'Lays a set of items out in one row and folds whatever will not fit into an overflow control — reach for `OverflowTooltip` instead when the thing overrunning is a single run of text rather than a set.',
  'By default the overflow is a `+N more` chip opening a popover of every item; compose it yourself from the `OverflowListMore` parts (`Trigger`, `Content`, `Header`, `Items`, `Count`), or pass any `overflowRenderer(hiddenItems, { allItems, visibleItems })` of your own.',
  'It re-measures whenever the container changes width.',
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

/** All nine tags fit in 640px, so the overflow chip never appears. */
export const Basic: StoryFn = () => (
  <div className='w-640'>
    <OverflowList
      className='gap-4'
      items={TAGS}
      itemRenderer={item => <Tag key={item}>{item}</Tag>}
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
      data-testid='tags'
      items={TAGS}
      itemRenderer={item => <Tag key={item}>{item}</Tag>}
    />
  </div>
);

const ATTACK_TYPES = ['RCE', 'XSS', 'SQL Injection', 'CSRF'];

/**
 * The full composition: a header counting every item over the popover list, built from
 * `OverflowListMoreHeader` and `OverflowListMoreCount` in plain JSX. Items already in the
 * row are listed first and faded.
 */
export const WithHeader: StoryFn = () => (
  <div className='w-120'>
    <OverflowList
      className='gap-4'
      data-testid='attacks'
      items={ATTACK_TYPES}
      itemRenderer={item => <Tag key={item}>{item}</Tag>}
      overflowRenderer={() => (
        <OverflowListMore>
          <OverflowListMoreTrigger />
          <OverflowListMoreContent>
            <OverflowListMoreHeader>
              <OverflowListMoreCount of='total' /> attack types
            </OverflowListMoreHeader>
            <OverflowListMoreItems />
          </OverflowListMoreContent>
        </OverflowListMore>
      )}
    />
  </div>
);

/**
 * `show='hidden'` lists only what the row folded away — the pattern for editable
 * contexts such as a multi-select input, where the visible chips are right there.
 */
export const HiddenOnly: StoryFn = () => (
  <div className='w-120'>
    <OverflowList
      className='gap-4'
      data-testid='attacks'
      items={ATTACK_TYPES}
      itemRenderer={item => <Tag key={item}>{item}</Tag>}
      overflowRenderer={() => (
        <OverflowListMore>
          <OverflowListMoreTrigger>
            +<OverflowListMoreCount />
          </OverflowListMoreTrigger>
          <OverflowListMoreContent>
            <OverflowListMoreItems show='hidden' />
          </OverflowListMoreContent>
        </OverflowListMore>
      )}
    />
  </div>
);

/** `placement='cover'` opens the popover over the row itself, from its left edge. */
export const CoverPlacement: StoryFn = () => (
  <div className='w-120'>
    <OverflowList
      className='gap-4'
      data-testid='attacks'
      items={ATTACK_TYPES}
      itemRenderer={item => <Tag key={item}>{item}</Tag>}
      overflowRenderer={() => <OverflowListMore placement='cover' />}
    />
  </div>
);

const PluralHeader = () => {
  const { totalCount } = useOverflowListMore();
  return (
    <OverflowListMoreHeader>
      {totalCount} {totalCount === 1 ? 'attack type' : 'attack types'}
    </OverflowListMoreHeader>
  );
};

/**
 * When the header needs the number as a value — pluralization, i18n — read it with
 * `useOverflowListMore()` inside your own component instead of `OverflowListMoreCount`.
 */
export const PluralizedHeader: StoryFn = () => (
  <div className='w-120'>
    <OverflowList
      className='gap-4'
      items={ATTACK_TYPES}
      itemRenderer={item => <Tag key={item}>{item}</Tag>}
      overflowRenderer={() => (
        <OverflowListMore>
          <OverflowListMoreTrigger />
          <OverflowListMoreContent>
            <PluralHeader />
            <OverflowListMoreItems />
          </OverflowListMoreContent>
        </OverflowListMore>
      )}
    />
  </div>
);

/**
 * `overflowRenderer` is just a function of the hidden items — anything goes, no popover
 * required.
 */
export const CustomRenderer: StoryFn = () => (
  <div className='w-120'>
    <OverflowList
      className='gap-4'
      items={ATTACK_TYPES}
      itemRenderer={item => <Tag key={item}>{item}</Tag>}
      overflowRenderer={hidden => <Tag>and {hidden.length} others</Tag>}
    />
  </div>
);
