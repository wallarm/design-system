import {
  Children,
  type FC,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { DrawerClose } from './DrawerClose';
import { DrawerDescription } from './DrawerDescription';
import { DrawerTitle } from './DrawerTitle';

export interface DrawerHeaderProps {
  children: ReactNode;
  /** Leading element before the title, e.g. an agent's `AgentAvatar` (72 px, live, shadow — `PLACES.drawerHeader`). Never clipped. */
  leading?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

const isDrawerClose = (child: ReactNode): child is ReactElement =>
  isValidElement(child) && child.type === DrawerClose;

const isDrawerTitle = (child: ReactNode): child is ReactElement =>
  isValidElement(child) && child.type === DrawerTitle;

const isDrawerDescription = (child: ReactNode): child is ReactElement =>
  isValidElement(child) && child.type === DrawerDescription;

export const DrawerHeader: FC<DrawerHeaderProps> = ({ children, leading, ref }) => {
  const testId = useTestId('header');
  const leadingTestId = useTestId('header-leading');
  const items = Children.toArray(children);

  const hasExplicitClose = items.some(isDrawerClose);
  const title = items.find(isDrawerTitle);
  const description = items.find(isDrawerDescription);
  const rest = items.filter(child => child !== title && child !== description);

  return (
    <div
      ref={ref}
      data-testid={testId}
      data-slot='drawer-header'
      className={cn(
        'relative shrink-0 w-full',
        'bg-bg-surface-2',
        'flex items-start justify-between gap-12',
        // Fallback when the type checks above miss DrawerTitle / DrawerDescription, e.g. on a
        // Claude Design canvas, which wraps every child in a `display: contents` host: the
        // description is then a direct child, so stack it under the title with CSS grid instead.
        '[&:has(>[data-slot=drawer-description])]:grid [&:has(>[data-slot=drawer-description])]:grid-cols-[minmax(0,1fr)]',
        '[&:has(>[data-slot=drawer-description])]:grid-rows-[auto_1fr] [&:has(>[data-slot=drawer-description])]:auto-cols-max',
        '[&:has(>[data-slot=drawer-description])]:gap-y-0',
        '[&:has(>[data-slot=drawer-description])>*:not([data-slot=drawer-title]):not([data-slot=drawer-description])]:row-[1/span_2]',
        // With a leading slot there, give it the first column and move the title stack to the second.
        '[&:has(>[data-slot=drawer-header-leading]):has(>[data-slot=drawer-description])]:grid-cols-[auto_minmax(0,1fr)]',
        '[&:has(>[data-slot=drawer-header-leading])>[data-slot=drawer-title]]:col-start-2',
        '[&:has(>[data-slot=drawer-header-leading])>[data-slot=drawer-description]]:col-start-2',
        // The same type check misses an explicit DrawerClose there: hide the automatic one, which renders last.
        '[&>[data-slot=drawer-close]~[data-slot=drawer-close]]:hidden',
        'pt-16 pb-12 pl-24 pr-16',
        'rounded-t-12',
        'outline-none',
      )}
    >
      {leading != null && (
        <div
          data-testid={leadingTestId}
          data-slot='drawer-header-leading'
          className='flex shrink-0 col-start-1'
        >
          {leading}
        </div>
      )}

      {(title || description) && (
        <div className='flex flex-1 flex-col gap-0 min-w-0'>
          {title}
          {description}
        </div>
      )}

      {rest}

      {!hasExplicitClose && <DrawerClose />}
    </div>
  );
};

DrawerHeader.displayName = 'DrawerHeader';
