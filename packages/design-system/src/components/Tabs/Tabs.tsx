import type { FC, ReactNode } from 'react';
import { Tabs as ArkUiTabs } from '@ark-ui/react/tabs';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { TabsSharedContextProvider } from './TabsSharedContext';
import type { TabsSize, TabsVariant } from './types';

export interface TabsProps extends TestableProps {
  children: ReactNode;
  size?: TabsSize;
  variant?: TabsVariant;
  value?: string;
  defaultValue?: string;
  lazyMount?: boolean;
  unmountOnExit?: boolean;
  asChild?: boolean;
  onChange?: (value: string) => void;
}

export const Tabs: FC<TabsProps> = ({
  children,
  value,
  defaultValue,
  onChange,
  size,
  variant,
  lazyMount = true,
  unmountOnExit = true,
  asChild = false,
  'data-testid': testId,
}) => {
  const handleChange = ({ value }: ArkUiTabs.ValueChangeDetails) => {
    onChange?.(value);
  };

  return (
    <TabsSharedContextProvider size={size} variant={variant}>
      <ArkUiTabs.Root
        className={cn('relative')}
        data-testid={testId}
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleChange}
        lazyMount={lazyMount}
        unmountOnExit={unmountOnExit}
        asChild={asChild}
      >
        <TestIdProvider value={testId}>{asChild ? children : children}</TestIdProvider>
      </ArkUiTabs.Root>
    </TabsSharedContextProvider>
  );
};

Tabs.displayName = 'Tabs';
