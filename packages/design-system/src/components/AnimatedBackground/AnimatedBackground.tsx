import type { FC } from 'react';
import { BlurBackground, type BlurBackgroundProps } from './blur';
import { PixelBackground, type PixelBackgroundProps } from './pixel';

type AnimatedBackgroundProps =
  | ({ variant?: 'pixel' } & PixelBackgroundProps)
  | ({ variant?: 'blur' } & BlurBackgroundProps);

export type { AnimatedBackgroundProps };

export const AnimatedBackground: FC<AnimatedBackgroundProps> = ({ variant = 'pixel', ...rest }) => {
  if (variant === 'blur') {
    return <BlurBackground {...(rest as BlurBackgroundProps)} />;
  }

  return <PixelBackground {...(rest as PixelBackgroundProps)} />;
};

AnimatedBackground.displayName = 'AnimatedBackground';
