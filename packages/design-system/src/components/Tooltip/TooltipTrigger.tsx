import { forwardRef } from 'react';

import { type TooltipTriggerProps, Trigger } from '@radix-ui/react-tooltip';

export const TooltipTrigger = forwardRef<
  React.ElementRef<typeof Trigger>,
  TooltipTriggerProps
>((props, ref) => <Trigger ref={ref} {...props} />);

TooltipTrigger.displayName = 'TooltipTrigger';
