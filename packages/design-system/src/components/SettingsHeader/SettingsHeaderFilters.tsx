import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface SettingsHeaderFiltersProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const SettingsHeaderFilters: FC<SettingsHeaderFiltersProps> = ({
  ref,
  children,
  className,
  ...props
}) => {
  const testId = useTestId('filters');

  return (
    <div
      {...props}
      ref={ref}
      data-testid={testId}
      data-slot='settings-header-filters'
      className={cn('flex gap-12 items-center', className)}
    >
      {children}
    </div>
  );
};

SettingsHeaderFilters.displayName = 'SettingsHeaderFilters';
