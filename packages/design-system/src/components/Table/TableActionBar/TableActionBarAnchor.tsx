import type { FC, ReactNode } from 'react';
import { Popover as ArkUiPopover } from '@ark-ui/react/popover';
import { cva } from 'class-variance-authority';
import { cn } from '../../../utils/cn';
import { useTableContext } from '../TableContext';

const tableActionBarAnchorVariants = cva(cn('relative'), {
  variants: {
    virtualized: {
      true: 'h-full',
    },
  },
});

interface TableActionBarAnchorProps {
  children: ReactNode;
}

export const TableActionBarAnchor: FC<TableActionBarAnchorProps> = ({ children }) => {
  const { virtualized } = useTableContext();

  return (
    <ArkUiPopover.Anchor className={cn(tableActionBarAnchorVariants({ virtualized }))}>
      {children}
    </ArkUiPopover.Anchor>
  );
};

TableActionBarAnchor.displayName = 'TableActionBarAnchor';
