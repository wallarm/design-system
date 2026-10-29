import { type ButtonHTMLAttributes, type FC, type ReactNode, type Ref, useId } from 'react';

import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { Button } from '../Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { messageActionVariants } from './classes';

export interface MessageActionProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'>, TestableProps {
  ref?: Ref<HTMLButtonElement>;
  /** Required: the accessible name and the tooltip text. */
  'aria-label': string;
  /** The icon. */
  children: ReactNode;
}

/**
 * Icon-only ghost button with a tooltip. The tooltip anchors to the button's `id`, so
 * an outer `DropdownMenuTrigger asChild` (which injects its own id) just works.
 *
 * The tooltip derives its test id from the action (`<action-id>--content`). As a
 * `DropdownMenuTrigger asChild` child, pass an explicit `data-testid` — the trigger
 * injects `<base>--trigger`, which otherwise replaces the cascaded `<base>--action`.
 */
export const MessageAction: FC<MessageActionProps> = ({
  ref,
  id,
  className,
  children,
  'aria-label': ariaLabel,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('action', testIdProp);
  const autoId = useId();
  const triggerId = id ?? autoId;

  return (
    <Tooltip ids={{ trigger: triggerId }} data-testid={testId}>
      <TooltipTrigger asChild>
        <Button
          type='button'
          {...props}
          ref={ref}
          id={triggerId}
          variant='ghost'
          color='neutral'
          size='small'
          aria-label={ariaLabel}
          data-slot='message-action'
          data-testid={testId}
          className={cn(messageActionVariants(), className)}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{ariaLabel}</TooltipContent>
    </Tooltip>
  );
};

MessageAction.displayName = 'MessageAction';
