import type { FC, Ref } from 'react';
import { Ellipsis } from '../../icons';
import { Button, type ButtonProps } from '../Button';

type SegmentedTabsTriggerButtonProps = Omit<
  ButtonProps<'span'>,
  'children' | 'variant' | 'color' | 'size' | 'tabIndex'
> & { ref?: Ref<HTMLElement> };

export const SegmentedTabsTriggerButton: FC<SegmentedTabsTriggerButtonProps> = props => {
  return (
    <Button
      {...props}
      as='span'
      variant='ghost'
      color='neutral'
      size='small'
      data-slot='segmented-tabs-trigger-button'
      tabIndex={-1}
    >
      <Ellipsis />
    </Button>
  );
};

SegmentedTabsTriggerButton.displayName = 'SegmentedTabsTriggerButton';
