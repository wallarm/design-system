import { useMemo } from 'react';
import {
  Select as ArkUiSelect,
  type CollectionItem,
  type SelectRootProps,
} from '@ark-ui/react/select';
import { TestIdProvider } from '../../utils/testId';
import { SelectSharedProvider } from './SelectSharedContext';

type SelectNativeProps<T extends CollectionItem> = Omit<
  SelectRootProps<T>,
  'positioning' | 'lazyMount' | 'unmountOnExit'
>;

export interface SelectBaseProps {
  loading?: boolean;
}

type SelectProps<T extends CollectionItem> = SelectNativeProps<T> & SelectBaseProps;

export const Select = <T extends CollectionItem>({
  children,
  loading = false,
  disabled = false,
  'data-testid': testId,
  ...props
}: SelectProps<T>) => {
  const positioning = useMemo<ArkUiSelect.RootProps<T>['positioning']>(
    () => ({
      offset: { mainAxis: 4 },
      gutter: 4,
      overflowPadding: 4,
    }),
    [],
  );

  return (
    <TestIdProvider value={testId}>
      <SelectSharedProvider value={{ loading }}>
        <ArkUiSelect.Root
          {...props}
          data-testid={testId}
          disabled={disabled}
          positioning={positioning}
          lazyMount
          unmountOnExit
        >
          <ArkUiSelect.HiddenSelect />
          {children}
        </ArkUiSelect.Root>
      </SelectSharedProvider>
    </TestIdProvider>
  );
};

Select.displayName = 'Select';
