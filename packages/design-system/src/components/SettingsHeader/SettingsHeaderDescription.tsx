import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface SettingsHeaderDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  ref?: Ref<HTMLParagraphElement>;
}

export const SettingsHeaderDescription: FC<SettingsHeaderDescriptionProps> = ({
  ref,
  children,
  className,
  ...props
}) => {
  const testId = useTestId('description');

  return (
    <p
      {...props}
      ref={ref}
      data-testid={testId}
      data-slot='settings-header-description'
      className={cn('text-sm text-text-secondary', className)}
    >
      {children}
    </p>
  );
};

SettingsHeaderDescription.displayName = 'SettingsHeaderDescription';
