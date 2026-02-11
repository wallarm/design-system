import type { FC, ReactNode } from 'react';
import { Tabs as ArkUiTabs } from '@ark-ui/react/tabs';
import { cn } from '../../utils/cn';
import { TabsSharedContextProvider } from './TabsSharedContext';
import type { TabsSize, TabsVariant } from './types';

interface TabsProps {
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
}) => {
  const handleChange = ({ value }: ArkUiTabs.ValueChangeDetails) => {
    onChange?.(value);
  };

  return (
    <TabsSharedContextProvider size={size} variant={variant}>
      <ArkUiTabs.Root
        className={cn('relative')}
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleChange}
        lazyMount={lazyMount}
        unmountOnExit={unmountOnExit}
        asChild={asChild}
      >
        {asChild ? <>{children}</> : children}
      </ArkUiTabs.Root>
    </TabsSharedContextProvider>
  );
};

Tabs.displayName = 'Tabs';
