import type { AnchorHTMLAttributes, ComponentType, FC, ReactNode, Ref } from 'react';
import { Slot } from '@radix-ui/react-slot';
import type { SvgIconProps } from '../../icons/SvgIcon';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Text } from '../Text';
import { navPanelItemVariants } from './classes';

export interface NavPanelItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  ref?: Ref<HTMLAnchorElement>;
  asChild?: boolean;
  icon?: ComponentType<SvgIconProps>;
  active?: boolean;
  children: ReactNode;
}

export const NavPanelItem: FC<NavPanelItemProps> = ({
  ref,
  asChild = false,
  icon: Icon,
  active = false,
  className,
  children,
  ...props
}) => {
  const testId = useTestId('item');
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      {...props}
      ref={ref}
      aria-current={active ? ('page' as const) : undefined}
      data-slot='nav-panel-item'
      data-testid={testId}
      className={cn(navPanelItemVariants({ active }), className)}
    >
      {Icon && (
        <span className='flex shrink-0 items-center justify-center'>
          <Icon size='md' />
        </span>
      )}
      <Text size='sm' truncate>
        {children}
      </Text>
    </Comp>
  );
};

NavPanelItem.displayName = 'NavPanelItem';
