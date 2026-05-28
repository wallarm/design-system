import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Text } from '../Text';

export interface NavPanelHeaderProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const NavPanelHeader: FC<NavPanelHeaderProps> = ({ ref, className, children, ...props }) => {
  const testId = useTestId('header');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='nav-panel-header'
      data-testid={testId}
      className={cn('sticky top-0 z-10 flex shrink-0 items-center p-4 bg-bg-surface-2', className)}
    >
      <Text size='sm' weight='medium'>
        {children}
      </Text>
    </div>
  );
};

NavPanelHeader.displayName = 'NavPanelHeader';
