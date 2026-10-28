import type { ButtonHTMLAttributes, FC, Ref } from 'react';

import { usePopoverContext } from '@ark-ui/react/popover';

import { Settings2 } from '../../icons';
import { type TestableProps, useTestId } from '../../utils/testId';
import { Button } from '../Button';
import { PopoverTrigger } from '../Popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { useChatPermissionsContext } from './ChatPermissionsContext';

export interface ChatPermissionsTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'>, TestableProps {
  ref?: Ref<HTMLButtonElement>;
}

const DEFAULT_LABEL = 'Permission settings';

export const ChatPermissionsTrigger: FC<ChatPermissionsTriggerProps> = ({
  ref,
  children,
  'aria-label': ariaLabel = DEFAULT_LABEL,
  'data-testid': testIdProp,
  ...rest
}) => {
  const { triggerId } = useChatPermissionsContext();
  const { open } = usePopoverContext();
  const testId = useTestId('trigger', testIdProp);
  const tooltipTestId = useTestId('tooltip');

  return (
    <Tooltip disabled={open} ids={{ trigger: triggerId }}>
      <PopoverTrigger asChild>
        <TooltipTrigger asChild>
          <Button
            type='button'
            {...rest}
            ref={ref}
            id={triggerId}
            data-slot='chat-permissions-trigger'
            data-testid={testId}
            variant='ghost'
            color='neutral'
            size='small'
            aria-label={ariaLabel}
          >
            {children ?? <Settings2 />}
          </Button>
        </TooltipTrigger>
      </PopoverTrigger>
      <TooltipContent data-testid={tooltipTestId}>{ariaLabel}</TooltipContent>
    </Tooltip>
  );
};

ChatPermissionsTrigger.displayName = 'ChatPermissionsTrigger';
