import { createContext, type FC, type ReactNode, useContext, useId } from 'react';

import type { TestableProps } from '../../utils/testId';
import { Popover, type PopoverProps } from '../Popover';

interface NotificationCenterContextValue {
  /** Shared so the bell's Tooltip and the Popover anchor on one button. */
  triggerId?: string;
  /** The root `data-testid`. Body hands it back to its children, so the tabs' cascade does not prefix them. */
  testId?: string;
}

const NotificationCenterContext = createContext<NotificationCenterContextValue>({});

export const useNotificationCenterContext = () => useContext(NotificationCenterContext);

export interface NotificationCenterProps extends TestableProps {
  children: ReactNode;
  /** Controlled open state. Omit for uncontrolled. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Default: right-aligned under the bell with a 4px gap. */
  positioning?: PopoverProps['positioning'];
}

const POSITIONING_DEFAULT: PopoverProps['positioning'] = { placement: 'bottom-end', gutter: 4 };

export const NotificationCenter: FC<NotificationCenterProps> = ({
  children,
  open,
  onOpenChange,
  positioning = POSITIONING_DEFAULT,
  'data-testid': testId,
}) => {
  const triggerId = useId();

  return (
    <NotificationCenterContext.Provider value={{ triggerId, testId }}>
      <Popover
        open={open}
        onOpenChange={onOpenChange}
        ids={{ trigger: triggerId }}
        positioning={positioning}
        data-testid={testId}
      >
        {children}
      </Popover>
    </NotificationCenterContext.Provider>
  );
};

NotificationCenter.displayName = 'NotificationCenter';
