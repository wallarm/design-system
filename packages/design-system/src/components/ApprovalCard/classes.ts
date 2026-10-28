import { cva } from 'class-variance-authority';

export const approvalCardVariants = cva('flex flex-col');

export const approvalCardCaptionVariants = cva(
  "px-16 py-2 font-mono [font-feature-settings:'liga'_0] text-xs text-text-secondary",
);

export const approvalCardSurfaceVariants = cva('rounded-16 border border-border-primary-light', {
  variants: {
    status: {
      pending: 'bg-bg-surface-2',
      approved:
        'flex h-44 items-center gap-8 bg-bg-light-primary px-12 text-sm text-text-secondary',
      rejected:
        'flex h-44 items-center gap-8 bg-bg-light-primary px-12 text-sm text-text-secondary',
    },
  },
  defaultVariants: { status: 'pending' },
});

export const approvalCardStatusIconVariants = cva('', {
  variants: {
    status: {
      approved: 'text-icon-success',
      rejected: 'text-icon-danger',
    },
  },
});

export const approvalCardContentVariants = cva(
  'flex flex-col gap-8 px-16 pt-12 text-sm break-words text-text-primary',
);

export const approvalCardActionsVariants = cva('flex flex-wrap items-center gap-8 px-16 py-12');
