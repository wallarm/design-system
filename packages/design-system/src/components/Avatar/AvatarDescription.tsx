import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import {
  OverflowTooltip,
  OverflowTooltipContent,
  OverflowTooltipTrigger,
} from '../OverflowTooltip';
import { useAvatarSize } from './AvatarContext';
import { avatarDescriptionVariants } from './classes';

export interface AvatarDescriptionProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
}

/** A second line under the name (e.g. the email), on one line, truncated with an ellipsis; the full text shows in a tooltip when it overflows. */
export const AvatarDescription: FC<AvatarDescriptionProps> = ({
  ref,
  className,
  children,
  ...props
}) => {
  const testId = useTestId('description');
  const size = useAvatarSize();

  return (
    <OverflowTooltip>
      <OverflowTooltipTrigger ref={ref as Ref<HTMLElement>}>
        <span
          {...props}
          data-slot='avatar-description'
          data-testid={testId}
          className={cn(avatarDescriptionVariants({ size }), className)}
        >
          {children}
        </span>
      </OverflowTooltipTrigger>
      <OverflowTooltipContent>{children}</OverflowTooltipContent>
    </OverflowTooltip>
  );
};

AvatarDescription.displayName = 'AvatarDescription';
