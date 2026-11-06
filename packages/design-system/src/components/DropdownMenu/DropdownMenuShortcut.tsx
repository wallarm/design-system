import type { FC, HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export const DropdownMenuShortcut: FC<HTMLAttributes<HTMLSpanElement>> = ({ ...props }) => {
  const testId = useTestId('shortcut');

  return <div {...props} data-testid={testId} className={cn('ml-auto self-start pl-8')} />;
};

DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';
