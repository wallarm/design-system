import type { ProgressColorEnum } from './constants';

export type ProgressSize = 'xs' | 'sm' | 'md' | 'lg';
export type ProgressColor = (typeof ProgressColorEnum)[keyof typeof ProgressColorEnum];
