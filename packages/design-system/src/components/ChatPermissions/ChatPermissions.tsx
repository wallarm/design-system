import { type FC, type ReactNode, useId } from 'react';

import { type TestableProps, useTestId } from '../../utils/testId';
import { Popover } from '../Popover';
import { ChatPermissionsContext } from './ChatPermissionsContext';

export interface ChatPermissionsProps extends TestableProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Root of the per-conversation tool permissions popover. Renders no DOM of its own —
 * it is a `Popover` root that shares one trigger id with the trigger's tooltip.
 */
export const ChatPermissions: FC<ChatPermissionsProps> = ({
  children,
  open,
  onOpenChange,
  'data-testid': testIdProp,
}) => {
  const testId = useTestId('permissions', testIdProp);
  const triggerId = useId();

  return (
    <ChatPermissionsContext.Provider value={{ triggerId }}>
      <Popover
        data-testid={testId}
        ids={{ trigger: triggerId }}
        positioning={{ placement: 'top-start', gutter: 8 }}
        open={open}
        onOpenChange={onOpenChange}
      >
        {children}
      </Popover>
    </ChatPermissionsContext.Provider>
  );
};

ChatPermissions.displayName = 'ChatPermissions';
