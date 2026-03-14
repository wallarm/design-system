import type { ComponentPropsWithoutRef, ElementRef, FC, Ref } from 'react';
import { Tooltip as ArkUiTooltip } from '@ark-ui/react/tooltip';
import { useTestId } from '../../utils/testId';

type TooltipTriggerProps = ComponentPropsWithoutRef<typeof ArkUiTooltip.Trigger> & {
  ref?: Ref<ElementRef<typeof ArkUiTooltip.Trigger>>;
};

export const TooltipTrigger: FC<TooltipTriggerProps> = ({ ref, ...props }) => {
  const testId = useTestId('trigger');

  return <ArkUiTooltip.Trigger ref={ref} {...props} data-testid={testId} />;
};

TooltipTrigger.displayName = 'TooltipTrigger';
