import {
  OverflowListMore,
  OverflowListMoreContent,
  OverflowListMoreCount,
  OverflowListMoreItems,
  OverflowListMoreTrigger,
} from '../../OverflowList';
import type { PopoverSizeDimension } from '../../Popover';
import { Tag } from '../../Tag';
import type { SelectDataItem } from '../types';
import { TAG_SIZE_BY_SELECT_SIZE } from './SelectInputItemRenderer';

const POPOVER_MAX_WIDTH: PopoverSizeDimension = '256px';

const renderPopoverItem = (item: SelectDataItem) => <Tag size='large'>{item.label}</Tag>;

// Factory, not a bare renderer: `SelectInput` closes over its own `size` to
// size the "+N" trigger tag the same way SelectInputItemRenderer sizes the
// individual item tags (see TAG_SIZE_BY_SELECT_SIZE). The popover content's
// own tags aren't squeezed into the 24/32/36px row, so they stay `large`.
// Editable context: the popover lists only what the row hides.
export const createSelectInputOverflowRenderer =
  (size: 'small' | 'medium' | 'default' | 'inline-edit') => () => (
    <OverflowListMore>
      <OverflowListMoreTrigger size={TAG_SIZE_BY_SELECT_SIZE[size]}>
        +<OverflowListMoreCount />
      </OverflowListMoreTrigger>
      <OverflowListMoreContent maxWidth={POPOVER_MAX_WIDTH}>
        <OverflowListMoreItems show='hidden' renderItem={renderPopoverItem} />
      </OverflowListMoreContent>
    </OverflowListMore>
  );
