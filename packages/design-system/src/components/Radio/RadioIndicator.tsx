import type { FC } from 'react';

import {
  RadioGroup as ArkUiRadioGroup,
  useRadioGroupItemContext,
} from '@ark-ui/react/radio-group';

import { Dot } from '../../icons';
import { cn } from '../../utils/cn';

export const RadioIndicator: FC = () => {
  const { checked } = useRadioGroupItemContext();

  return (
    <ArkUiRadioGroup.ItemControl
      className={cn(
        // Layout
        'flex items-center justify-center self-start my-2',
        // Dimensions
        'w-16 h-16',
        // Visual
        'rounded-full shadow-xs overlay transition-all data-focus-visible:ring-3',
        // Icon
        '[&_svg]:icon-md [&_svg]:text-icon-primary-alt [&_svg]:shrink-0 [&_svg]:pointer-events-none [&_svg]:stroke-6',
        // States ---- unchecked
        'bg-bg-surface-3 border border-border-primary',
        // States ---- unchecked hover
        '[&[data-state=unchecked][data-hover]:not([data-active])]:bg-states-primary-hover',
        // States ---- unchecked active
        '[&[data-state=unchecked][data-active]]:bg-states-primary-pressed',
        // States ---- unchecked focus
        '[&[data-state=unchecked][data-focus-visible]]:ring-focus-primary',
        // States ---- checked
        'data-[state=checked]:bg-bg-fill-brand',
        'data-[state=checked]:border-bg-fill-brand',
        // States ---- checked hover
        '[&[data-state=checked][data-hover]:not([data-active])]:overlay-states-on-fill-hover',
        // States ---- checked active
        '[&[data-state=checked][data-active]]:overlay-states-on-fill-hover',
        // States ---- checked focus
        '[&[data-state=checked][data-focus-visible]]:overlay-states-on-fill-hover',
        '[&[data-state=checked][data-focus-visible]]:ring-focus-brand',
      )}
    >
      {checked && <Dot />}
    </ArkUiRadioGroup.ItemControl>
  );
};

RadioIndicator.displayName = 'RadioIndicator';
