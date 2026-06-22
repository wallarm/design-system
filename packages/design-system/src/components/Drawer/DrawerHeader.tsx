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

export interface DrawerHeaderProps {
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

const isDrawerClose = (child: ReactNode): child is ReactElement =>
  isValidElement(child) && child.type === DrawerClose;

export const DrawerHeader: FC<DrawerHeaderProps> = ({ children, ref }) => {
  const testId = useTestId('header');
  const hasExplicitClose = Children.toArray(children).some(isDrawerClose);

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
      {children}

      {!hasExplicitClose && <DrawerClose />}
    </div>
  );
};

DrawerHeader.displayName = 'DrawerHeader';
