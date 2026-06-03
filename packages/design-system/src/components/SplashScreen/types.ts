import type { HTMLAttributes, ReactNode, Ref } from 'react';

export type ContentPhase = 'enter-start' | 'entered' | 'content-fading' | 'exiting';

export type PhaseType = ContentPhase | 'shrinking' | 'settled' | 'exited';

export interface SplashScreenShrinkTarget {
  width: number;
  height: number;
  borderRadius?: number;
}

export interface SplashScreenProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  visible?: boolean;
  shrinkTarget?: SplashScreenShrinkTarget;
  children?: ReactNode;
}
