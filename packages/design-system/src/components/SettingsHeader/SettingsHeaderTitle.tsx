import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface SettingsHeaderTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  ref?: Ref<HTMLHeadingElement>;
}

export const SettingsHeaderTitle: FC<SettingsHeaderTitleProps> = ({
  ref,
  children,
  className,
  ...props
}) => {
  const testId = useTestId('title');

  return (
    <h1
      {...props}
      ref={ref}
      data-testid={testId}
      data-slot='settings-header-title'
      className={cn(
        'font-sans-display text-xl font-medium leading-28 text-text-primary truncate',
        className,
      )}
    >
      {children}
    </h1>
  );
};

SettingsHeaderTitle.displayName = 'SettingsHeaderTitle';
