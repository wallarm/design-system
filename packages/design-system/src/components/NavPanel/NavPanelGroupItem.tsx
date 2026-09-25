import type { AnchorHTMLAttributes, ComponentType, FC, ReactNode, Ref } from 'react';
import { Slot } from '@radix-ui/react-slot';
import type { SvgIconProps } from '../../icons/SvgIcon';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Text } from '../Text';
import { navPanelGroupItemVariants } from './classes';
import { NAV_PANEL_BASE_PADDING, useNavPanelDepth, useNavPanelIndent } from './NavPanelContext';

export interface NavPanelGroupItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  ref?: Ref<HTMLAnchorElement>;
  asChild?: boolean;
  icon?: ComponentType<SvgIconProps>;
  active?: boolean;
  children: ReactNode;
}

export const NavPanelGroupItem: FC<NavPanelGroupItemProps> = ({
  ref,
  asChild = false,
  icon: Icon,
  active = false,
  className,
  children,
  ...props
}) => {
  const testId = useTestId('group-item');
  const depth = useNavPanelDepth();
  const indent = useNavPanelIndent();
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      {...props}
      ref={ref}
      aria-current={active ? ('page' as const) : undefined}
      data-slot='nav-panel-group-item'
      data-testid={testId}
      className={cn(navPanelGroupItemVariants({ active }), className)}
      style={{ paddingLeft: 8 + depth * indent }}
    >
      {Icon && (
        <span className='flex shrink-0 items-center justify-center'>
          <Icon size='md' />
        </span>
      )}
      <Text size='sm' truncate>
        {children}
      </Text>
      {active && depth > 0 && (
        // Branded: the active item draws its own brand segment over the group's tree line
        // (NavPanelGroupContent), at the same x. Neutral keeps the plain gray line.
        <span
          aria-hidden
          className='absolute top-0 bottom-0 hidden w-px bg-border-brand branded:block'
          style={{ left: depth * indent - NAV_PANEL_BASE_PADDING }}
        />
      )}
    </Comp>
  );
};

NavPanelGroupItem.displayName = 'NavPanelGroupItem';
