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

export const chartActionsVariants = cva('flex items-center gap-4 ml-auto', {
  variants: {
    alwaysVisible: {
      true: '',
      false: [
        'w-0 overflow-hidden opacity-0 pointer-events-none',
        'group-hover/chart:w-auto group-hover/chart:overflow-visible group-hover/chart:opacity-100 group-hover/chart:pointer-events-auto',
        'group-focus-within/chart:w-auto group-focus-within/chart:overflow-visible group-focus-within/chart:opacity-100 group-focus-within/chart:pointer-events-auto',
      ].join(' '),
    },
  },
  defaultVariants: {
    alwaysVisible: false,
  },
});
