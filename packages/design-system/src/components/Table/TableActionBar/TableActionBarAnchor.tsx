import type { FC, ReactNode } from 'react';
import { Popover as ArkUiPopover } from '@ark-ui/react/popover';
import { cva } from 'class-variance-authority';
import { cn } from '../../../utils/cn';
import type { TestableProps } from '../../../utils/testId';
import { useTableContext } from '../TableContext';

const tableActionBarAnchorVariants = cva(cn('w-full relative outline-none'), {
  variants: {
    virtualized: {
      container: 'h-full',
      window: '',
    },
  },
});

interface TableActionBarAnchorProps extends TestableProps {
  className?: string;
  children: ReactNode;
}

export const TableActionBarAnchor: FC<TableActionBarAnchorProps> = ({
  className,
  'data-testid': testId,
  children,
}) => {
  const { virtualized } = useTableContext();

  return (
    <ArkUiPopover.Anchor
      data-testid={testId}
      className={cn(tableActionBarAnchorVariants({ virtualized }), className)}
    >
      {children}
    </ArkUiPopover.Anchor>
  );
};

TableActionBarAnchor.displayName = 'TableActionBarAnchor';
