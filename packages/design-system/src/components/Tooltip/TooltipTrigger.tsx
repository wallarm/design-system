import type { ComponentPropsWithoutRef, ComponentRef, FC, Ref } from 'react';
import { Tooltip as ArkUiTooltip } from '@ark-ui/react/tooltip';
import { type TestableProps, useTestId } from '../../utils/testId';

export type TooltipTriggerProps = ComponentPropsWithoutRef<typeof ArkUiTooltip.Trigger> &
  TestableProps & {
    ref?: Ref<ComponentRef<typeof ArkUiTooltip.Trigger>>;
  };

export const TooltipTrigger: FC<TooltipTriggerProps> = ({
  ref,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('trigger', testIdProp);

  return <ArkUiTooltip.Trigger ref={ref} {...props} data-testid={testId} />;
};

TooltipTrigger.displayName = 'TooltipTrigger';
