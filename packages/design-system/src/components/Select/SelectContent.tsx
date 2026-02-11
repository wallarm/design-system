import { Children, type FC } from 'react';
import { Select as ArkUiSelect } from '@ark-ui/react/select';
import { cn } from '../../utils/cn';
import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaViewport,
} from '../ScrollArea';
import { SelectEmptyState } from './SelectEmptyState';

type SelectContentProps = Omit<ArkUiSelect.ContentProps, 'className'>;

export const SelectContent: FC<SelectContentProps> = ({ children, ...props }) => {
  const isEmpty = Children.count(children) === 0;

  return (
    <ArkUiSelect.List
      {...props}
      className={cn('flex flex-col p-8 overflow-hidden outline-none')}
      asChild
    >
      <ScrollArea>
        <ScrollAreaViewport>
          <ScrollAreaContent className='flex flex-col gap-1'>
            {isEmpty ? <SelectEmptyState /> : children}
          </ScrollAreaContent>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar />
        <ScrollAreaCorner />
      </ScrollArea>
    </ArkUiSelect.List>
  );
};

SelectContent.displayName = 'SelectContent';
