import type { FC, ReactNode } from 'react';
import type { TestableProps } from '../../../utils/testId';
import { TableActionBarAnchor, TableActionBarProvider } from '../TableActionBar';
import { TableScrollHandlerProvider } from '../TableScrollHandlerContext';
import { TableSettingsMenuProvider } from '../TableSettingsMenu';
import type { TableVirtualized } from '../types';
import { TableInnerContainer } from './TableInnerContainer';
import { TableInnerWindow } from './TableInnerWindow';

interface TableInnerProps extends TestableProps {
  isEmpty: boolean;
  virtualized?: TableVirtualized;
  showSettings: boolean;
  hasConsumerSettingsMenu: boolean;
  hasConsumerScrollHandler: boolean;
  ariaLabel?: string;
  className?: string;
  children?: ReactNode;
}

export const TableInner: FC<TableInnerProps> = ({
  isEmpty,
  virtualized,
  showSettings,
  hasConsumerSettingsMenu,
  hasConsumerScrollHandler,
  ariaLabel,
  className,
  'data-testid': testId,
  children,
}) => {
  return (
    <TableActionBarProvider>
      <TableActionBarAnchor className={className} data-testid={testId}>
        <TableSettingsMenuProvider>
          <TableScrollHandlerProvider hasConsumerScrollHandler={hasConsumerScrollHandler}>
            {virtualized === 'window' ? (
              <TableInnerWindow
                isEmpty={isEmpty}
                showSettings={showSettings}
                hasConsumerSettingsMenu={hasConsumerSettingsMenu}
                ariaLabel={ariaLabel}
              >
                {children}
              </TableInnerWindow>
            ) : (
              <TableInnerContainer
                isEmpty={isEmpty}
                virtualized={virtualized}
                showSettings={showSettings}
                hasConsumerSettingsMenu={hasConsumerSettingsMenu}
                ariaLabel={ariaLabel}
              >
                {children}
              </TableInnerContainer>
            )}
          </TableScrollHandlerProvider>
        </TableSettingsMenuProvider>
      </TableActionBarAnchor>
    </TableActionBarProvider>
  );
};

TableInner.displayName = 'TableInner';
