import { Children, type FC } from 'react';
import { Select as ArkUiSelect } from '@ark-ui/react/select';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaViewport,
} from '../ScrollArea';
import { SelectEmptyState } from './SelectEmptyState';

type SelectContentProps = Omit<ArkUiSelect.ContentProps, 'className'> & TestableProps;

export const SelectContent: FC<SelectContentProps> = ({
  children,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('content', testIdProp);
  const isEmpty = Children.count(children) === 0;

  return (
    <ArkUiSelect.List
      {...props}
      data-testid={testId}
      className={cn('flex flex-col p-8 overflow-hidden outline-none')}
      asChild
    >
      <ScrollArea>
        {/* The viewport is tabbable only until it measures no overflow; as the initial focus it
            would drop focus to <body> once its tabindex goes away. */}
        <ScrollAreaViewport data-no-autofocus=''>
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
