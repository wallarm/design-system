import type { FC, ReactNode } from 'react';
import { Popover as ArkUiPopover } from '@ark-ui/react/popover';
import { cva } from 'class-variance-authority';
import { cn } from '../../../utils/cn';
import { useTableContext } from '../TableContext';

const tableActionBarAnchorVariants = cva(cn('w-full relative outline-none'), {
  variants: {
    virtualized: {
      container: 'h-full',
      window: '',
    },
  },
});

interface TableActionBarAnchorProps {
  className?: string;
  children: ReactNode;
}

export const TableActionBarAnchor: FC<TableActionBarAnchorProps> = ({ className, children }) => {
  const { virtualized } = useTableContext();

  return (
    <ArkUiPopover.Anchor className={cn(tableActionBarAnchorVariants({ virtualized }), className)}>
      {children}
    </ArkUiPopover.Anchor>
  );
};

TableActionBarAnchor.displayName = 'TableActionBarAnchor';
