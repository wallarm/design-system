import { cn } from '../../../utils/cn';
import { Popover, PopoverContent, type PopoverSizeDimension, PopoverTrigger } from '../../Popover';
import { HStack } from '../../Stack';
import { Tag } from '../../Tag';
import type { SelectDataItem } from '../types';
import { TAG_SIZE_BY_SELECT_SIZE } from './SelectInputItemRenderer';

const POPOVER_MAX_WIDTH: PopoverSizeDimension = '256px';

// Factory, not a bare renderer: `OverflowList`'s `overflowRenderer` only
// receives `items`, so `SelectInput` closes over its own `size` here to
// size the "+N" trigger tag the same way SelectInputItemRenderer sizes the
// individual item tags (see TAG_SIZE_BY_SELECT_SIZE). The popover content's
// own tags aren't squeezed into the 24/32/36px row, so they stay `large`.
export const createSelectInputOverflowRenderer =
  (size: 'small' | 'medium' | 'default') => (items: SelectDataItem[]) => (
    <Popover>
      <PopoverTrigger className={cn('**:data-[slot=tag]:cursor-help')} asChild>
        <Tag size={TAG_SIZE_BY_SELECT_SIZE[size]}>+{items.length}</Tag>
      </PopoverTrigger>
      <PopoverContent minHeight='auto' maxWidth={POPOVER_MAX_WIDTH}>
        <HStack gap={4} wrap='wrap'>
          {items.map(item => (
            <Tag key={item.value} size='large'>
              {item.label}
            </Tag>
          ))}
        </HStack>
      </PopoverContent>
    </Popover>
  );
