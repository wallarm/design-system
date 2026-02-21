import type { TableAccessorColumnDef, TableDisplayColumnDef } from '../types';

export interface TableColumnHelper<T> {
  accessor: <K extends keyof T & string>(
    key: K,
    options?: Omit<TableAccessorColumnDef<T, T[K]>, 'accessorKey'>,
  ) => TableAccessorColumnDef<T, T[K]>;

  display: (options: Omit<TableDisplayColumnDef<T>, 'accessorKey'>) => TableDisplayColumnDef<T>;
}

export function createTableColumnHelper<T>(): TableColumnHelper<T> {
  return {
    accessor: (key, options = {}) => ({
      ...options,
      accessorKey: key,
    }),
    display: options => ({
      ...options,
      accessorKey: undefined,
    }),
  };
}
