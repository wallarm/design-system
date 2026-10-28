import { type FC, type ReactNode, useId } from 'react';

import { cn } from '../../utils/cn';
import { dropdownMenuLabelVariants } from '../DropdownMenu/classes';
import { PopoverContent, type PopoverContentProps } from '../Popover';
import { chatPermissionsContentVariants } from './classes';

export interface ChatPermissionsContentProps extends Omit<
  PopoverContentProps,
  'minWidth' | 'maxWidth'
> {
  /** Heading above the tool rows; also names the dialog. Pass `null`, `false` or `''` to hide it. */
  label?: ReactNode;
}

export const ChatPermissionsContent: FC<ChatPermissionsContentProps> = ({
  label = 'Always allowed in this conversation',
  className,
  children,
  ...rest
}) => {
  const labelId = useId();
  const hasLabel = label != null && label !== false && label !== '';

  return (
    <PopoverContent
      aria-labelledby={hasLabel ? labelId : undefined}
      {...rest}
      data-slot='chat-permissions-content'
      minWidth='320px'
      maxWidth='320px'
      className={cn(chatPermissionsContentVariants(), className)}
    >
      {hasLabel && (
        <p id={labelId} className={dropdownMenuLabelVariants()}>
          {label}
        </p>
      )}
      {children}
    </PopoverContent>
  );
};

ChatPermissionsContent.displayName = 'ChatPermissionsContent';
