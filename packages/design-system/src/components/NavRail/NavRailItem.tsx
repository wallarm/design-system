import {
  type AnchorHTMLAttributes,
  type ComponentType,
  type FC,
  Fragment,
  type ReactNode,
  type Ref,
  useRef,
  useState,
} from 'react';
import { composeRefs } from '@radix-ui/react-compose-refs';
import { Slot, Slottable } from '@radix-ui/react-slot';
import type { SvgIconProps } from '../../icons/SvgIcon';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { Kbd } from '../Kbd';
import { Tooltip } from '../Tooltip';
import { TooltipContent } from '../Tooltip/TooltipContent';
import { TooltipTrigger } from '../Tooltip/TooltipTrigger';
import { navRailItemCompactLabelClassName, navRailItemVariants } from './classes';
import { useNavRailContext } from './NavRailContext';
import { useShortcut } from './useShortcut';

export interface NavRailItemProps extends AnchorHTMLAttributes<HTMLAnchorElement>, TestableProps {
  ref?: Ref<HTMLAnchorElement>;
  asChild?: boolean;
  icon: ComponentType<SvgIconProps>;
  label: ReactNode;
  shortcut?: string[];
  active?: boolean;
  /** Seats the icon on a soft plate, for the signed-in user's item at the foot of the rail. */
  avatar?: boolean;
  /** User photo for the plate (implies `avatar`). The icon stays underneath and returns if the photo fails to load. */
  avatarSrc?: string;
}

export const NavRailItem: FC<NavRailItemProps> = ({
  ref,
  asChild = false,
  icon: Icon,
  label,
  shortcut,
  active = false,
  avatar = false,
  avatarSrc,
  className,
  children,
  'data-testid': testIdProp,
  ...props
}) => {
  const { mode } = useNavRailContext();
  const testId = useTestId('item', testIdProp);
  const Comp = asChild ? Slot : 'a';
  const internalRef = useRef<HTMLAnchorElement>(null);
  const [failedSrc, setFailedSrc] = useState<string>();
  const photo = avatarSrc && avatarSrc !== failedSrc ? avatarSrc : undefined;
  const hasPlate = avatar || avatarSrc !== undefined;
  const showsLabel = mode === 'expanded' || (mode === 'compact' && !hasPlate);
  // Without a visible label the link would have no name, so hand the label to assistive tech.
  const fallbackName = !showsLabel && typeof label === 'string' ? label : undefined;

  useShortcut(shortcut, internalRef);

  const element = (
    <Comp
      {...props}
      ref={composeRefs(internalRef, ref)}
      aria-label={props['aria-label'] ?? fallbackName}
      aria-current={active ? ('page' as const) : undefined}
      data-slot='nav-rail-item'
      data-testid={testId}
      className={cn(navRailItemVariants({ mode, active }), className)}
    >
      <span className='flex shrink-0 items-center justify-center'>
        {hasPlate ? (
          // The plate overhangs the 16px icon slot by 4px on every side, so labels stay aligned.
          // Icon and photo share one grid cell rather than using absolute positioning, so the
          // item's hover/active overlay still tints the plate.
          <span
            data-slot='nav-rail-item-avatar'
            className={cn(
              '-m-4 grid size-24 place-items-center overflow-hidden rounded-8 bg-states-primary-hover *:col-start-1 *:row-start-1',
              !photo && 'border border-border-primary',
            )}
          >
            <Icon size='md' />
            {photo && (
              <img
                src={photo}
                alt=''
                className='size-full object-cover'
                onError={() => setFailedSrc(photo)}
              />
            )}
          </span>
        ) : (
          <Icon size='md' />
        )}
      </span>
      {mode === 'expanded' && (
        <span
          className={cn('truncate whitespace-nowrap transition-[opacity,width] duration-200 pl-8')}
        >
          {label}
        </span>
      )}
      {/* In compact the avatar item shows the plate alone; the tooltip still names the user. */}
      {showsLabel && mode === 'compact' && (
        <span className={navRailItemCompactLabelClassName}>{label}</span>
      )}
      <Slottable>{children}</Slottable>
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
