import { cva } from 'class-variance-authority';

/** Connector chip text */
export const connectorTextVariants = cva(
  'text-sm font-normal truncate',
  {
    variants: {
      error: {
        true: 'text-text-danger',
        false: 'text-text-secondary',
      },
    },
    defaultVariants: {
      error: false,
    },
  },
);
