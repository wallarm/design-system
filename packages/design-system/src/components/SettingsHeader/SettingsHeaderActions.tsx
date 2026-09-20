import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface SettingsHeaderActionsProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const SettingsHeaderActions: FC<SettingsHeaderActionsProps> = ({
  ref,
  children,
  className,
  ...props
}) => {
  const testId = useTestId('actions');

  return (
    <div
      {...props}
      ref={ref}
      data-testid={testId}
      data-slot='settings-header-actions'
      className={cn('flex items-center gap-8 shrink-0 ml-auto', className)}
    >
      {children}
    </div>
  );
};

SettingsHeaderActions.displayName = 'SettingsHeaderActions';
