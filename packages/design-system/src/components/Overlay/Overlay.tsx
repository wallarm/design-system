import type { FC, HTMLAttributes, Ref } from 'react';

import { cn } from '../../utils/cn';

type OverlayProps = Omit<HTMLAttributes<HTMLDivElement>, 'className'> & {
  ref?: Ref<HTMLDivElement>;
};

export const Overlay: FC<OverlayProps> = (props) => (
  <div
    {...props}
    className={cn(
      'fixed inset-0',
      'data-[state=open]:animate-in data-[state=open]:fade-in-0',
      'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
      'transition-opacity duration-200',
      'backdrop-blur-xs bg-component-dialog-overlay',
      'z-[calc(var(--drawer-overlay-z-index)+(var(--layer-index)*var(--drawer-level-ratio)))]',
    )}
  />
);

Overlay.displayName = 'Overlay';
