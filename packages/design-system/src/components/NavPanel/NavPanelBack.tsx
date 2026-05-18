import type { ButtonHTMLAttributes, FC, ReactNode, Ref } from 'react';
import { CornerUpLeft } from '../../icons';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Text } from '../Text';

export interface NavPanelBackProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
}

export const NavPanelBack: FC<NavPanelBackProps> = ({ ref, className, children, ...props }) => {
  const testId = useTestId('back');

  return (
    <button
      {...props}
      ref={ref}
      type='button'
      data-slot='nav-panel-back'
      data-testid={testId}
      className={cn(
        'overlay flex h-32 shrink-0 w-full cursor-pointer items-center gap-8 rounded-6 p-8 text-sm text-text-secondary transition-colors outline-none hover:overlay-states-primary-hover focus-visible:overlay-states-primary-hover active:overlay-states-primary-pressed',
        className,
      )}
    >
      <CornerUpLeft size='md' />
      <Text size='sm' truncate>
        Back to {children}
      </Text>
    </button>
  );
};

NavPanelBack.displayName = 'NavPanelBack';
