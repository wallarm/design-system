import type { FC, InputHTMLAttributes } from 'react';
import { type TestableProps, useTestId } from '../../../utils/testId';
import { DropdownMenuInput } from '../../DropdownMenu';
import { useTableSettingsMenuContentContext } from './TableSettingsMenuContentContext';

export interface TableSettingsMenuSearchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'>,
    TestableProps {}

export const TableSettingsMenuSearch: FC<TableSettingsMenuSearchProps> = ({
  'data-testid': testIdProp,
  placeholder = 'Search',
  ...rest
}) => {
  const testId = useTestId('settings-menu-search', testIdProp);
  const { search, setSearch } = useTableSettingsMenuContentContext();

  return (
    <DropdownMenuInput
      {...rest}
      data-testid={testId}
      placeholder={placeholder}
      value={search}
      onChange={e => setSearch(e.target.value)}
    />
  );
};

TableSettingsMenuSearch.displayName = 'TableSettingsMenuSearch';
