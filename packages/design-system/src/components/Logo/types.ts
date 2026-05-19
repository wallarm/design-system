import type { VariantProps } from 'class-variance-authority';
import type { logoVariants } from './classes';

export type LogoType = 'icon' | 'wordmark' | 'full';
export type LogoStyle = 'default' | 'white' | 'full-white';
export type LogoSize = NonNullable<VariantProps<typeof logoVariants>['size']>;
