import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';

export interface SettingsHeaderProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const SettingsHeader: FC<SettingsHeaderProps> = ({
  ref,
  className,
  children,
  'data-testid': testId,
  ...props
}) => {
  return (
    <TestIdProvider value={testId}>
      <div
        {...props}
        ref={ref}
        data-testid={testId}
        data-slot='settings-header'
        className={cn('flex flex-col gap-6 pb-12 pt-8 px-24', className)}
      >
        {children}
      </div>
    </TestIdProvider>
  );
};

SettingsHeader.displayName = 'SettingsHeader';
