import type { VariantProps } from 'class-variance-authority';
import type { wallyIconVariants } from './classes';

export type WallyIconStyle = 'simple' | 'circle';
export type WallyIconSize = NonNullable<VariantProps<typeof wallyIconVariants>['size']>;
