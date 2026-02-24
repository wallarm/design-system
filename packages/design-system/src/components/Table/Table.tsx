import { TableProvider } from './TableContext';
import { TableInner } from './TableInner';
import type { TableProps } from './types';

export const Table = <T,>(props: TableProps<T>) => {
  const {
    data,
    isLoading = false,
    children,
    className,
    'aria-label': ariaLabel,
    ...providerProps
  } = props;

  const isEmpty = data.length === 0 && !isLoading;
  const showSettings = !!props.onColumnVisibilityChange || !!props.onColumnOrderChange;

  return (
    <TableProvider data={data} isLoading={isLoading} {...providerProps}>
      <TableInner
        isEmpty={isEmpty}
        virtualized={!!props.virtualized}
        showSettings={showSettings}
        ariaLabel={ariaLabel}
        className={className}
      >
        {children}
      </TableInner>
    </TableProvider>
  );
};

Table.displayName = 'Table';
