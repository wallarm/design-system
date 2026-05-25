import { cva } from 'class-variance-authority';

export const splashContentVariants = cva(
  'flex h-max w-max flex-col items-center justify-center gap-12',
  {
    variants: {
      phase: {
        'enter-start': 'opacity-0',
        entered: 'opacity-100 transition-opacity duration-500 ease-out',
        exiting: 'opacity-0 transition-opacity duration-300 ease-out',
      },
    },
  },
);

export const splashLogoVariants = cva('', {
  variants: {
    phase: {
      'enter-start': 'translate-y-8',
      entered: 'translate-y-0 transition-transform duration-500 ease-out',
      exiting: 'translate-y-0 transition-transform duration-500 ease-out',
    },
  },
});

export const splashProgressVariants = cva('', {
  variants: {
    phase: {
      'enter-start': 'translate-y-16',
      entered: 'translate-y-0 transition-transform duration-500 ease-out',
      exiting: 'translate-y-0 transition-transform duration-500 ease-out',
    },
  },
});
