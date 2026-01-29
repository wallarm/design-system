import { cva } from 'class-variance-authority';

import { cn } from '../../utils/cn';

export const buttonBaseVariants = cva(
  cn(
    'items-center justify-center min-w-0 rounded-8',
    'text-sm font-medium font-sans',
    'cursor-pointer overflow-hidden transition-[color,border,box-shadow,opacity]',
    'focus-visible:outline-none focus-visible:ring-3',
    'data-[focus=true]:outline-none data-[focus=true]:ring-3',
    '[&_svg]:pointer-events-none [&_svg]:icon-md [&_svg]:shrink-0',
    'disabled:cursor-not-allowed disabled:[&_*]:pointer-events-none',
  ),
  {
    variants: {
      size: {
        small: 'h-24 px-8 py-2 gap-4',
        medium: 'h-32 px-12 py-6 gap-6',
        large: 'h-36 px-16 py-8 gap-8',
      },
      iconOnly: {
        true: '',
        false: '',
      },
      loading: {
        true: 'relative',
      },
      hasNonTextEnd: {
        true: '',
        false: '',
      },
      fullWidth: {
        true: 'flex flex-1 basis-full w-full',
        false: 'inline-flex',
      },
    },
    compoundVariants: [
      // region --- Icon only
      { iconOnly: true, size: 'small', className: 'w-24 h-24 p-2' },
      { iconOnly: true, size: 'medium', className: 'w-32 h-32 p-6' },
      { iconOnly: true, size: 'large', className: 'w-36 h-36 p-8' },
      // endregion

      // region --- Non-text end adjustment
      { hasNonTextEnd: true, size: 'small', className: 'pr-2' },
      { hasNonTextEnd: true, size: 'medium', className: 'pr-6' },
      { hasNonTextEnd: true, size: 'large', className: 'pr-10' },
      // endregion
    ],
  },
);
