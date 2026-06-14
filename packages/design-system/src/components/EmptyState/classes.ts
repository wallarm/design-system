import { cva } from 'class-variance-authority';

export type EmptyStateType = 'collection-empty' | 'no-results';

export const emptyStateVariants = cva('flex flex-col items-center text-center gap-16 m-[0_auto]', {
  variants: {
    type: {
      'collection-empty': 'max-w-[560px] min-w-[256px]',
      'no-results': 'w-[240px] py-16',
    },
  },
  defaultVariants: {
    type: 'collection-empty',
  },
});
