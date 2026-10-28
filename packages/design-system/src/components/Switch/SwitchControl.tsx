import { type FC, useContext } from 'react';

import { Switch as ArkUiSwitch, useSwitchContext } from '@ark-ui/react/switch';

import { Check, X } from '../../icons';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { SwitchContext } from './SwitchContext';

export const SwitchControl: FC = () => {
  const arkContext = useSwitchContext();
  const { a11yMode } = useContext(SwitchContext);
  const testId = useTestId('control');
  const isChecked = arkContext.checked;

  return (
    <ArkUiSwitch.Control
      data-testid={testId}
      className={cn(
        'relative my-2 flex items-center self-start',
        'h-20 w-34',
        'overlay overflow-hidden rounded-8 transition-all data-focus-visible:ring-3',
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
        <X className='pointer-events-none absolute top-1/2 right-2 z-0 h-10 w-10 -translate-y-1/2 text-icon-secondary' />
      )}
      {a11yMode && isChecked && (
        <Check className='pointer-events-none absolute top-1/2 left-2 z-0 h-10 w-10 -translate-y-1/2 text-white' />
      )}
      <ArkUiSwitch.Thumb
        className={cn(
          'h-12 w-16',
          'relative z-[9] rounded-4 bg-icon-primary-alt shadow-sm transition-all',
          'translate-x-4',
          'data-[state=checked]:translate-x-14',
        )}
      />
    </ArkUiSwitch.Control>
  );
};

SwitchControl.displayName = 'SwitchControl';
