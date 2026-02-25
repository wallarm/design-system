import type { FC, ReactNode } from 'react';
import { TableActionBarAnchor, TableActionBarProvider } from '../TableActionBar';
import { TableInnerContainer } from './TableInnerContainer';
import { TableInnerWindow } from './TableInnerWindow';
import type { TableVirtualized } from '../types';

interface TableInnerProps {
  isEmpty: boolean;
  virtualized?: TableVirtualized;
  showSettings: boolean;
  ariaLabel?: string;
  className?: string;
  children?: ReactNode;
}

export const TableInner: FC<TableInnerProps> = ({
  isEmpty,
  virtualized,
  showSettings,
  ariaLabel,
  className,
  children,
}) => {
  return (
    <TableActionBarProvider>
      <TableActionBarAnchor className={className}>
        {virtualized === 'window' ? (
          <TableInnerWindow isEmpty={isEmpty} showSettings={showSettings} ariaLabel={ariaLabel}>
            {children}
          </TableInnerWindow>
        ) : (
          <TableInnerContainer
            isEmpty={isEmpty}
            virtualized={virtualized}
            showSettings={showSettings}
            ariaLabel={ariaLabel}
          >
            {children}
          </TableInnerContainer>
        )}
      </TableActionBarAnchor>
    </TableActionBarProvider>
  );
};

TableInner.displayName = 'TableInner';
