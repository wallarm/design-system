import type { FC, HTMLAttributes, Ref } from 'react';

import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
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

/** The person's name, on one line, truncated with an ellipsis; the full text shows in a tooltip when it overflows. */
export const AvatarName: FC<AvatarNameProps> = ({ ref, className, children, ...props }) => {
  const testId = useTestId('name');
  const size = useAvatarSize();

  return (
    <OverflowTooltip>
      <OverflowTooltipTrigger ref={ref as Ref<HTMLElement>}>
        <span
          {...props}
          data-slot='avatar-name'
          data-testid={testId}
          className={cn(avatarNameVariants({ size }), className)}
        >
          {children}
        </span>
      </OverflowTooltipTrigger>
      <OverflowTooltipContent>{children}</OverflowTooltipContent>
    </OverflowTooltip>
  );
};

AvatarName.displayName = 'AvatarName';
