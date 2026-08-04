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
        'relative shrink-0 w-full',
        'bg-bg-surface-2',
        'flex items-start justify-between gap-12',
        'pt-16 pb-12 pl-24 pr-16',
        'rounded-t-12',
        'outline-none',
      )}
    >
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
