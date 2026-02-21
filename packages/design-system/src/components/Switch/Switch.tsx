import type { FC } from 'react';
import { Switch as ArkUiSwitch } from '@ark-ui/react/switch';
import { cn } from '../../utils/cn';
import { SwitchContext } from './SwitchContext';

export interface SwitchProps extends ArkUiSwitch.RootProps {
  a11yMode?: boolean;
}

export const Switch: FC<SwitchProps> = ({ children, className, a11yMode = false, ...props }) => (
  <SwitchContext.Provider value={{ a11yMode }}>
    <ArkUiSwitch.Root
      {...props}
      className={cn(
        'items-center gap-x-8',
        '[&:not(:has([data-part=description]))]:flex',
        '[&:has([data-part=description])]:grid',
        '[&:has([data-part=description])]:grid-cols-[40px_auto]',
        '*:data-[part=description]:col-start-2 *:data-[part=description]:col-end-3',
        '[&:not([data-disabled])]:cursor-pointer',
        'data-disabled:opacity-50 data-disabled:pointer-events-none data-disabled:cursor-not-allowed',
        className,
      )}
    >
      {children}
      <ArkUiSwitch.HiddenInput />
    </ArkUiSwitch.Root>
  </SwitchContext.Provider>
);

Switch.displayName = 'Switch';
