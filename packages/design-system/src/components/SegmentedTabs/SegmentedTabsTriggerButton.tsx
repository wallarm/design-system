import type { FC, Ref } from 'react';
import { Ellipsis } from '../../icons';
import { useTestId } from '../../utils/testId';
import { Button, type ButtonProps } from '../Button';

type SegmentedTabsTriggerButtonProps = Omit<
  ButtonProps<'span'>,
  'children' | 'variant' | 'color' | 'size' | 'tabIndex'
> & { ref?: Ref<HTMLElement> };

export const SegmentedTabsTriggerButton: FC<SegmentedTabsTriggerButtonProps> = ({
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('trigger-button', testIdProp);

  return (
    <Button
      {...props}
      data-testid={testId}
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
