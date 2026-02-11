import type { FC, HTMLAttributes, MouseEvent, ReactNode, Ref } from 'react';
import { Popover as ArkUiPopover } from '@ark-ui/react/popover';

type PopoverNativeProps = HTMLAttributes<HTMLButtonElement>;

interface PopoverTriggerBaseProps {
  children: ReactNode;
  asChild?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

export type PopoverTriggerProps = PopoverNativeProps & PopoverTriggerBaseProps;

export const PopoverTrigger: FC<PopoverTriggerProps> = ({ asChild = false, ...props }) => {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  return <ArkUiPopover.Trigger {...props} asChild={asChild} onClick={handleClick} />;
};

PopoverTrigger.displayName = 'PopoverTrigger';
