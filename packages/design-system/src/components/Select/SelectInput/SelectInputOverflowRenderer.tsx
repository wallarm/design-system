import { cn } from '../../../utils/cn';
import {
  Popover,
  PopoverContent,
  type PopoverSizeDimension,
  PopoverTrigger,
} from '../../Popover';
import { HStack } from '../../Stack';
import { Tag } from '../../Tag';
import { type SelectDataItem } from '../types';

const POPOVER_MAX_WIDTH: PopoverSizeDimension = '256px';

export const SelectInputOverflowRenderer = (items: SelectDataItem[]) => (
  <Popover>
    <PopoverTrigger className={cn('**:data-[slot=tag]:cursor-help')} asChild>
      <Tag size="large">+{items.length}</Tag>
    </PopoverTrigger>
    <PopoverContent minHeight="auto" maxWidth={POPOVER_MAX_WIDTH}>
      <HStack spacing={4} wrap="wrap">
        {items.map((item) => (
          <Tag key={item.value} size="large">
            {item.label}
          </Tag>
        ))}
      </HStack>
    </PopoverContent>
  </Popover>
);
