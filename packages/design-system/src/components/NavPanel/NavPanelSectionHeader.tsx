import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Text } from '../Text';

export interface NavPanelSectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const NavPanelSectionHeader: FC<NavPanelSectionHeaderProps> = ({
  ref,
  className,
  children,
  ...props
}) => {
  const testId = useTestId('section-header');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='nav-panel-section-header'
      data-testid={testId}
      className={cn('flex h-26 shrink-0 items-center px-8 pt-8 pb-2', className)}
    >
      <Text size='xs' weight='medium' color='secondary'>
        {children}
      </Text>
    </div>
  );
};

NavPanelSectionHeader.displayName = 'NavPanelSectionHeader';
