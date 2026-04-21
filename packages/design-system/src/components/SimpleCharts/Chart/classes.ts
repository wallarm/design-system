import { cva } from 'class-variance-authority';

export const chartRootClasses = [
  'group/chart',
  'relative flex flex-col',
  'w-full min-h-196',
  'bg-bg-surface-1',
  'border border-border-primary-light',
  'rounded-8',
  'overflow-clip',
].join(' ');

export const chartHeaderClasses = [
  'flex items-center justify-between',
  'h-32 shrink-0',
  'pl-12 pr-4',
  'text-text-primary',
].join(' ');

export const chartEmptyClasses = [
  'flex flex-1 items-center justify-center',
  'px-12 py-24',
  'text-center',
].join(' ');

export const chartActionsVariants = cva(
  ['flex items-center gap-4 ml-auto', 'transition-opacity'].join(' '),
  {
    variants: {
      alwaysVisible: {
        true: 'opacity-100',
        false: 'opacity-0 group-hover/chart:opacity-100 group-focus-within/chart:opacity-100',
      },
    },
    defaultVariants: {
      alwaysVisible: false,
    },
  },
);
