import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { avatarContentClassNames } from './classes';

export interface AvatarContentProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
}

/** The text beside the plate — `AvatarName` with an optional `AvatarDescription` under it. */
export const AvatarContent: FC<AvatarContentProps> = ({ ref, className, ...props }) => {
  const testId = useTestId('content');

  return (
    <span
      data-testid={testId}
      {...props}
      ref={ref}
      data-slot='avatar-content'
      className={cn(avatarContentClassNames, className)}
    />
  );
};

AvatarContent.displayName = 'AvatarContent';
