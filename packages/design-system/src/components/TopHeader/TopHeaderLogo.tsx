import type { AnchorHTMLAttributes, FC, ReactNode, Ref } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface TopHeaderLogoProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  ref?: Ref<HTMLAnchorElement>;
  asChild?: boolean;
  children?: ReactNode;
}

export const TopHeaderLogo: FC<TopHeaderLogoProps> = ({
  ref,
  asChild = false,
  className,
  children,
  ...props
}) => {
  const testId = useTestId('logo');
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      {...props}
      ref={ref}
      data-slot='top-header-logo'
      data-testid={testId}
      className={cn(
        'overlay inline-flex items-center gap-6 rounded-6 px-6 py-4 text-sm font-semibold outline-none transition-colors',
        'hover:overlay-states-primary-hover focus-visible:overlay-states-primary-hover active:overlay-states-primary-pressed',
        className,
      )}
    >
      {children}
    </Comp>
  );
};

TopHeaderLogo.displayName = 'TopHeaderLogo';
