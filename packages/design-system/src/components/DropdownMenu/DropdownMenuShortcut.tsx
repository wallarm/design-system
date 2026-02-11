import type { FC, HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export const DropdownMenuShortcut: FC<HTMLAttributes<HTMLSpanElement>> = ({ ...props }) => {
  return <div {...props} className={cn('ml-auto self-start pl-8')} />;
};

DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';
