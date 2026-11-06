import type { FC, HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export const DropdownMenuShortcut: FC<HTMLAttributes<HTMLSpanElement>> = ({ ...props }) => {
  const testId = useTestId('shortcut');

  return <div data-testid={testId} {...props} className={cn('ml-auto self-start pl-8')} />;
};

DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';
