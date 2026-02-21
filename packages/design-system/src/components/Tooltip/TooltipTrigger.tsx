import type { ComponentPropsWithoutRef, ElementRef, FC, Ref } from 'react';
import { Tooltip as ArkUiTooltip } from '@ark-ui/react/tooltip';

type TooltipTriggerProps = ComponentPropsWithoutRef<typeof ArkUiTooltip.Trigger> & {
  ref?: Ref<ElementRef<typeof ArkUiTooltip.Trigger>>;
};

export const TooltipTrigger: FC<TooltipTriggerProps> = ({ ref, ...props }) => (
  <ArkUiTooltip.Trigger ref={ref} {...props} />
);

TooltipTrigger.displayName = 'TooltipTrigger';
