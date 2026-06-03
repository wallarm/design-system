import { cva } from 'class-variance-authority';

export const splashContainerVariants = cva('flex items-center justify-center', {
  variants: {
    phase: {
      'enter-start': 'h-full w-full',
      entered: 'h-full w-full',
      'content-fading': 'h-full w-full',
      shrinking: 'h-full w-full',
      settled: 'overflow-hidden',
      exiting: 'h-full w-full',
    },
  },
});

export const splashContentVariants = cva(
  'flex h-max w-max flex-col items-center justify-center gap-12',
  {
    variants: {
      phase: {
        'enter-start': 'opacity-0',
        entered: 'opacity-100 transition-opacity duration-500 ease-out',
        'content-fading': 'opacity-0 transition-opacity duration-300 ease-out',
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
      'content-fading': 'translate-y-0',
      exiting: 'translate-y-0 transition-transform duration-500 ease-out',
    },
  },
});

export const splashProgressVariants = cva('', {
  variants: {
    phase: {
      'enter-start': 'translate-y-16',
      entered: 'translate-y-0 transition-transform duration-500 ease-out',
      'content-fading': 'translate-y-0',
      exiting: 'translate-y-0 transition-transform duration-500 ease-out',
    },
  },
});
