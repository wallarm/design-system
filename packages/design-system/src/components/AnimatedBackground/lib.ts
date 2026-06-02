import type { AnimatedBackgroundProps } from './AnimatedBackground';
import type { EngineOptions, Texture } from './types';

const LOGIN_BG_DEFAULTS: Record<
  Texture,
  Pick<EngineOptions, 'spacing' | 'bloomRadius' | 'maxDotSize'>
> = {
  clean: { spacing: 20, bloomRadius: 44, maxDotSize: 20 },
  halftone: { spacing: 16, bloomRadius: 80, maxDotSize: 20 },
};

export const resolveOptions = (props: AnimatedBackgroundProps): EngineOptions => {
  const texture: Texture = props.texture ?? 'halftone';
  const d = LOGIN_BG_DEFAULTS[texture];
  return {
    texture,
    spacing: props.spacing ?? d.spacing,
    sweepPeriod: props.sweepPeriod ?? 12.5,
    bloomRadius: props.bloomRadius ?? d.bloomRadius,
    anomalyInterval: props.anomalyInterval ?? 1.4,
    intensity: props.intensity ?? 0.9,
    bloomAlpha: props.bloomAlpha ?? 0.2,
    maxDotSize: props.maxDotSize ?? d.maxDotSize,
    tilt: props.tilt ?? 16,
    dotColorVar: props.dotColorVar ?? '--login-bg-dot',
    accentColorVar: props.accentColorVar ?? '--login-bg-accent',
    baseColorVar: props.baseColorVar ?? '--login-bg-base',
    sweepColorVar: props.sweepColorVar ?? '--login-bg-sweep',
  };
};
