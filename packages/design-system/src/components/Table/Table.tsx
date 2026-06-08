import type { ComponentType } from 'react';
import { TestIdProvider } from '../../utils/testId';
import { containsDirectChild } from './lib';
import { TableProvider } from './TableContext';
import { TableImperativeBridge } from './TableImperativeBridge';
import { TableInner } from './TableInner';
import { TableSettingsMenu } from './TableSettingsMenu';
import type { TableProps } from './types';

export const Table = <T,>(props: TableProps<T>) => {
  const {
    data,
    isLoading = false,
    children,
    className,
    'aria-label': ariaLabel,
    'data-testid': testId,
    ref,
    ...providerProps
  } = props;

  const isEmpty = data.length === 0 && !isLoading;
  const showSettings = !!props.onColumnVisibilityChange || !!props.onColumnOrderChange;
  const hasConsumerSettingsMenu = containsDirectChild(
    children,
    TableSettingsMenu as ComponentType<unknown>,
  );

  return (
    <TableProvider data={data} isLoading={isLoading} {...providerProps}>
      {ref ? <TableImperativeBridge handleRef={ref} /> : null}
      <TestIdProvider value={testId}>
        <TableInner
          isEmpty={isEmpty}
          virtualized={props.virtualized}
          showSettings={showSettings}
          hasConsumerSettingsMenu={hasConsumerSettingsMenu}
          ariaLabel={ariaLabel}
          className={className}
          data-testid={testId}
        >
          {children}
        </TableInner>
      </TestIdProvider>
    </TableProvider>
  );
};

Table.displayName = 'Table';
