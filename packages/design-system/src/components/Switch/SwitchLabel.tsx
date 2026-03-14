import type { FC } from 'react';
import { Switch as ArkUiSwitch } from '@ark-ui/react/switch';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export type SwitchLabelProps = ArkUiSwitch.LabelProps;

export const SwitchLabel: FC<SwitchLabelProps> = ({ className, ...props }) => {
  const testId = useTestId('label');

  return (
    <ArkUiSwitch.Label
      {...props}
      data-testid={testId}
      className={cn(
        'flex items-center gap-4',
        'font-sans text-sm font-normal text-text-primary',
        className,
      )}
    />
  );
};

SwitchLabel.displayName = 'SwitchLabel';
