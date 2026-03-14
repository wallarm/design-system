import type { FC, HTMLAttributes, MouseEvent, ReactNode, Ref } from 'react';
import { Popover as ArkUiPopover } from '@ark-ui/react/popover';
import { useTestId } from '../../utils/testId';

type PopoverNativeProps = HTMLAttributes<HTMLButtonElement>;

interface PopoverTriggerBaseProps {
  children: ReactNode;
  asChild?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

export type PopoverTriggerProps = PopoverNativeProps & PopoverTriggerBaseProps;

export const PopoverTrigger: FC<PopoverTriggerProps> = ({ asChild = false, ...props }) => {
  const testId = useTestId('trigger');

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  return (
    <ArkUiPopover.Trigger {...props} asChild={asChild} data-testid={testId} onClick={handleClick} />
  );
};

PopoverTrigger.displayName = 'PopoverTrigger';
