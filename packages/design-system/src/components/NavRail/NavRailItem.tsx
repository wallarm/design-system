import {
  type AnchorHTMLAttributes,
  type ComponentType,
  type FC,
  Fragment,
  type ReactNode,
  type Ref,
  useRef,
} from 'react';
import { composeRefs } from '@radix-ui/react-compose-refs';
import { Slot } from '@radix-ui/react-slot';
import type { SvgIconProps } from '../../icons/SvgIcon';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Kbd } from '../Kbd';
import { Tooltip } from '../Tooltip';
import { TooltipContent } from '../Tooltip/TooltipContent';
import { TooltipTrigger } from '../Tooltip/TooltipTrigger';
import { navRailItemVariants } from './classes';
import { useNavRailContext } from './NavRailContext';
import { useShortcut } from './useShortcut';

export interface NavRailItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  ref?: Ref<HTMLAnchorElement>;
  asChild?: boolean;
  icon: ComponentType<SvgIconProps>;
  label: ReactNode;
  shortcut?: string[];
  active?: boolean;
}

export const NavRailItem: FC<NavRailItemProps> = ({
  ref,
  asChild = false,
  icon: Icon,
  label,
  shortcut,
  active = false,
  className,
  children,
  ...props
}) => {
  const { collapsed } = useNavRailContext();
  const testId = useTestId('item');
  const Comp = asChild ? Slot : 'a';
  const internalRef = useRef<HTMLAnchorElement>(null);

  useShortcut(shortcut, internalRef);

  const element = (
    <Comp
      {...props}
      ref={composeRefs(internalRef, ref)}
      aria-current={active ? ('page' as const) : undefined}
      data-slot='nav-rail-item'
      data-testid={testId}
      className={cn(navRailItemVariants({ active }), className)}
    >
      <span className='flex shrink-0 items-center justify-center'>
        <Icon size='md' />
      </span>
      {!collapsed && (
        <span
          className={cn('truncate whitespace-nowrap transition-[opacity,width] duration-200 pl-8')}
        >
          {label}
        </span>
      )}
      {children}
    </Comp>
  );

  return (
    <Tooltip positioning={{ placement: 'right' }}>
      <TooltipTrigger asChild>
        {props['aria-haspopup'] ? <span className='flex flex-1'>{element}</span> : element}
      </TooltipTrigger>
      <TooltipContent>
        {label}{' '}
        {shortcut &&
          shortcut.length > 0 &&
          shortcut.map((key, index) => (
            <Fragment key={key}>
              {index > 0 && ' then '}
              <Kbd size='small'>{key}</Kbd>
            </Fragment>
          ))}
      </TooltipContent>
    </Tooltip>
  );
};

NavRailItem.displayName = 'NavRailItem';
