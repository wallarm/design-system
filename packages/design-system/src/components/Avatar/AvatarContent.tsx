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
      {...props}
      ref={ref}
      data-slot='avatar-content'
      data-testid={testId}
      className={cn(avatarContentClassNames, className)}
    />
  );
};

AvatarContent.displayName = 'AvatarContent';
