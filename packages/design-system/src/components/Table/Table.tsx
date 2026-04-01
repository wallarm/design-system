import { TestIdProvider } from '../../utils/testId';
import { TableProvider } from './TableContext';
import { TableInner } from './TableInner';
import { TablePreviewDrawer } from './TablePreviewDrawer';
import type { TableProps } from './types';

export const Table = <T,>(props: TableProps<T>) => {
  const {
    data,
    isLoading = false,
    children,
    className,
    'aria-label': ariaLabel,
    'data-testid': testId,
    ...providerProps
  } = props;

  const isEmpty = data.length === 0 && !isLoading;
  const showSettings = !!props.onColumnVisibilityChange || !!props.onColumnOrderChange;

  return (
    <TableProvider data={data} isLoading={isLoading} {...providerProps}>
      <TestIdProvider value={testId}>
        <TableInner
          isEmpty={isEmpty}
          virtualized={props.virtualized}
          showSettings={showSettings}
          ariaLabel={ariaLabel}
          className={className}
          data-testid={testId}
        >
          {children}
        </TableInner>
        <TablePreviewDrawer />
      </TestIdProvider>
    </TableProvider>
  );
};

Table.displayName = 'Table';
