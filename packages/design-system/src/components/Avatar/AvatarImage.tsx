import type { FC, ImgHTMLAttributes, Ref } from 'react';
import { Avatar as ArkAvatar } from '@ark-ui/react/avatar';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { avatarImageClassNames } from './classes';

export interface AvatarImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  ref?: Ref<HTMLImageElement>;
}

/**
 * The photo. Always render it — Ark tracks `src` changes on the mounted element — and pass
 * `src={undefined}` for "no photo". Decorative by default (`alt=''`).
 */
export const AvatarImage: FC<AvatarImageProps> = ({ ref, alt = '', className, ...props }) => {
  const testId = useTestId('image');

  return (
    <ArkAvatar.Image
      {...props}
      ref={ref}
      alt={alt}
      data-slot='avatar-image'
      data-testid={testId}
      className={cn(avatarImageClassNames, className)}
    />
  );
};

AvatarImage.displayName = 'AvatarImage';
