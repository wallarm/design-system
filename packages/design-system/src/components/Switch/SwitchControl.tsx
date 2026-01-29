import type { FC } from 'react';
import { useContext } from 'react';

import { Switch as ArkUiSwitch, useSwitchContext } from '@ark-ui/react/switch';

import { Check, X } from '../../icons';
import { cn } from '../../utils/cn';

import { SwitchContext } from './SwitchContext';

export const SwitchControl: FC = () => {
  const arkContext = useSwitchContext();
  const { a11yMode } = useContext(SwitchContext);
  const isChecked = arkContext.checked;

  return (
    <ArkUiSwitch.Control
      className={cn(
        'relative flex items-center self-start my-2',
        'w-34 h-20',
        'rounded-8 overflow-hidden overlay transition-all data-focus-visible:ring-3',
        'bg-component-switcher-bg',
        '[&[data-hover]:not([data-active]):not([data-state=checked])]:overlay-states-primary-hover',
        '[&[data-active]:not([data-state=checked])]:overlay-states-primary-pressed',
        '[&[data-focus-visible]:not([data-state=checked])]:ring-focus-primary',
        'data-[state=checked]:bg-bg-fill-brand',
        '[&[data-hover]:not([data-active])[data-state=checked]]:overlay-states-on-fill-hover',
        '[&[data-active][data-state=checked]]:overlay-states-on-fill-pressed',
        '[&[data-focus-visible][data-state=checked]]:ring-focus-brand',
      )}
    >
      {a11yMode && !isChecked && (
        <X className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 text-icon-secondary pointer-events-none z-0" />
      )}
      {a11yMode && isChecked && (
        <Check className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 text-white pointer-events-none z-0" />
      )}
      <ArkUiSwitch.Thumb
        className={cn(
          'w-16 h-12',
          'bg-icon-primary-alt rounded-4 shadow-sm transition-all relative z-10',
          'translate-x-4',
          'data-[state=checked]:translate-x-14',
        )}
      />
    </ArkUiSwitch.Control>
  );
};

SwitchControl.displayName = 'SwitchControl';
