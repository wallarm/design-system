import type { ButtonHTMLAttributes, FC, FocusEvent, ReactNode } from 'react';
import { Tabs as ArkUiTabs } from '@ark-ui/react/tabs';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { tabsTriggerVariants } from './classes';
import { TABS_SCROLL_BUTTON_WIDTH } from './constants';
import { useTabsSharedContext } from './TabsSharedContext';

type TabsTriggerNativeProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'value' | 'onFocus' | 'children'
>;

export interface TabsTriggerProps extends TabsTriggerNativeProps, TestableProps {
  children: ReactNode;
  value: string;
  asChild?: boolean;
  onFocus?: (e: FocusEvent<HTMLButtonElement>) => void;
}

export const TabsTrigger: FC<TabsTriggerProps> = ({
  children,
  value,
  disabled = false,
  asChild = false,
  className,
  onFocus,
  'data-testid': testIdProp,
  ...rest
}) => {
  const contextTestId = useTestId('trigger');
  const { scrollRef, size } = useTabsSharedContext();

  const handleFocus = (e: FocusEvent<HTMLButtonElement>) => {
    onFocus?.(e);

    const el = e.currentTarget;
    const parent = scrollRef.current;
    if (!parent) return;

    const rect = el.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();

    if (rect.left < parentRect.left) {
      parent.scrollBy({
        left: rect.left - parentRect.left - TABS_SCROLL_BUTTON_WIDTH,
        behavior: 'smooth',
      });
    }

    if (rect.right > parentRect.right) {
      parent.scrollBy({
        left: rect.right - parentRect.right + TABS_SCROLL_BUTTON_WIDTH,
        behavior: 'smooth',
      });
    }
  };

  return (
    <ArkUiTabs.Trigger
      {...rest}
      className={cn(tabsTriggerVariants({ size }), className)}
      data-testid={testIdProp ?? contextTestId}
      value={value}
      disabled={disabled}
      asChild={asChild}
      onFocus={handleFocus}
      tabIndex={0}
    >
      {children}
    </ArkUiTabs.Trigger>
  );
};

TabsTrigger.displayName = 'TabsTrigger';
