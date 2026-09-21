import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface SettingsHeaderBreadcrumbsProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const SettingsHeaderBreadcrumbs: FC<SettingsHeaderBreadcrumbsProps> = ({
  ref,
  children,
  className,
  ...props
}) => {
  const testId = useTestId('breadcrumbs');

  return (
    <div
      {...props}
      ref={ref}
      data-testid={testId}
      data-slot='settings-header-breadcrumbs'
      className={cn('ml-[-4px]', className)}
    >
      {children}
    </div>
  );
};

SettingsHeaderBreadcrumbs.displayName = 'SettingsHeaderBreadcrumbs';
