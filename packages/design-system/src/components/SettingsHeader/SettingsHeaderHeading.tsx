import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface SettingsHeaderHeadingProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const SettingsHeaderHeading: FC<SettingsHeaderHeadingProps> = ({
  ref,
  children,
  className,
  ...props
}) => {
  const testId = useTestId('heading');

  return (
    <div
      {...props}
      ref={ref}
      data-testid={testId}
      data-slot='settings-header-heading'
      className={cn('flex items-center justify-between gap-16 w-full', className)}
    >
      {children}
    </div>
  );
};

SettingsHeaderHeading.displayName = 'SettingsHeaderHeading';
