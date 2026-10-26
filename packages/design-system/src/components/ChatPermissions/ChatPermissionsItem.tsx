import type { FC, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Switch, SwitchControl, SwitchLabel, type SwitchProps } from '../Switch';
import { chatPermissionsItemDescriptionVariants, chatPermissionsItemVariants } from './classes';

export interface ChatPermissionsItemCheckedChangeDetails {
  checked: boolean;
  /** The row's `name`, so one handler can serve the whole list. */
  name: string;
}

export interface ChatPermissionsItemProps extends Omit<
  SwitchProps,
  'children' | 'title' | 'name' | 'onCheckedChange'
> {
  ref?: Ref<HTMLLabelElement>;
  /** Machine name of the tool, e.g. `propose_add_to_denylist`; echoed back in `onCheckedChange`. */
  name: string;
  /** Visible tool name. */
  title: ReactNode;
  description?: ReactNode;
  onCheckedChange?: (details: ChatPermissionsItemCheckedChangeDetails) => void;
}

export const ChatPermissionsItem: FC<ChatPermissionsItemProps> = ({
  name,
  title,
  description,
  onCheckedChange,
  className,
  'data-testid': testIdProp,
  ...rest
}) => {
  const testId = useTestId('item', testIdProp);

  return (
    <Switch
      {...rest}
      name={name}
      onCheckedChange={onCheckedChange && (({ checked }) => onCheckedChange({ checked, name }))}
      data-slot='chat-permissions-item'
      data-testid={testId}
      className={cn(chatPermissionsItemVariants(), className)}
    >
      <span className='flex min-w-0 flex-1 flex-col'>
        <SwitchLabel>{title}</SwitchLabel>
        {description != null && (
          <span className={chatPermissionsItemDescriptionVariants()}>{description}</span>
        )}
      </span>
      <SwitchControl />
    </Switch>
  );
};

ChatPermissionsItem.displayName = 'ChatPermissionsItem';
