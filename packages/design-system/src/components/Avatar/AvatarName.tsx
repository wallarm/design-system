import { type FC, type HTMLAttributes, type Ref, useContext } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { HoverCardTriggerSideContext } from '../HoverCard/HoverCardContext';
import {
  OverflowTooltip,
  OverflowTooltipContent,
  OverflowTooltipTrigger,
} from '../OverflowTooltip';
import { useAvatarSize } from './AvatarContext';
import { avatarNameVariants } from './classes';

export interface AvatarNameProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
}

/**
 * The person's name, on one line, truncated with an ellipsis; the full text shows in a tooltip when it overflows —
 * except on a HoverCard's trigger side, where the card shows the full name and the tooltip would only flash before it.
 */
export const AvatarName: FC<AvatarNameProps> = ({ ref, className, children, ...props }) => {
  const testId = useTestId('name');
  const size = useAvatarSize();
  const onHoverCardTrigger = useContext(HoverCardTriggerSideContext);

  const name = (
    <span
      {...props}
      ref={onHoverCardTrigger ? ref : undefined}
      data-slot='avatar-name'
      data-testid={testId}
      className={cn(avatarNameVariants({ size }), className)}
    >
      {children}
    </span>
  );

  if (onHoverCardTrigger) return name;

  return (
    <OverflowTooltip>
      <OverflowTooltipTrigger ref={ref as Ref<HTMLElement>}>{name}</OverflowTooltipTrigger>
      <OverflowTooltipContent>{children}</OverflowTooltipContent>
    </OverflowTooltip>
  );
};

AvatarName.displayName = 'AvatarName';
