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
  ref?: Ref<HTMLDivElement>;
}

const isDrawerClose = (child: ReactNode): child is ReactElement =>
  isValidElement(child) && child.type === DrawerClose;

const isDrawerTitle = (child: ReactNode): child is ReactElement =>
  isValidElement(child) && child.type === DrawerTitle;

const isDrawerDescription = (child: ReactNode): child is ReactElement =>
  isValidElement(child) && child.type === DrawerDescription;

export const DrawerHeader: FC<DrawerHeaderProps> = ({ children, ref }) => {
  const testId = useTestId('header');
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
        'relative w-full shrink-0',
        'bg-bg-surface-2',
        'flex items-start justify-between gap-12',
        // Fallback when the type checks above miss DrawerTitle / DrawerDescription, e.g. on a
        // Claude Design canvas, which wraps every child in a `display: contents` host: the
        // description is then a direct child, so stack it under the title with CSS grid instead.
        '[&:has(>[data-slot=drawer-description])]:grid [&:has(>[data-slot=drawer-description])]:grid-cols-[minmax(0,1fr)]',
        '[&:has(>[data-slot=drawer-description])]:auto-cols-max [&:has(>[data-slot=drawer-description])]:grid-rows-[auto_1fr]',
        '[&:has(>[data-slot=drawer-description])]:gap-y-0',
        '[&:has(>[data-slot=drawer-description])>*:not([data-slot=drawer-title]):not([data-slot=drawer-description])]:row-[1/span_2]',
        // The same type check misses an explicit DrawerClose there: hide the automatic one, which renders last.
        '[&>[data-slot=drawer-close]~[data-slot=drawer-close]]:hidden',
        'pt-16 pr-16 pb-12 pl-24',
        'rounded-t-12',
        'outline-none',
      )}
    >
      {(title || description) && (
        <div className='flex min-w-0 flex-1 flex-col gap-0'>
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
