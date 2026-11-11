import { cva } from 'class-variance-authority';

import { cn } from '../../utils/cn';

export const buttonBaseVariants = cva(
  cn(
    'min-w-0 shrink-0 items-center justify-center rounded-8',
    'font-sans text-sm font-medium whitespace-nowrap',
    'cursor-pointer overflow-hidden transition-[color,border,box-shadow,opacity]',
    'focus-visible:ring-3 focus-visible:outline-none',
    'data-[focus=true]:ring-3 data-[focus=true]:outline-none',
    '[&_svg]:pointer-events-none [&_svg]:icon-md [&_svg]:shrink-0',
    'disabled:cursor-not-allowed disabled:[&_*]:pointer-events-none',
  ),
  {
    variants: {
      size: {
        small: 'h-24 gap-4 px-8 py-2',
        medium: 'h-32 gap-6 px-12 py-6',
        large: 'h-36 gap-8 px-16 py-8',
        'inline-edit': 'h-28 gap-5 px-10 py-4',
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
        // shrink re-enables shrinking (overrides base shrink-0 via cn) so
        // multiple fullWidth buttons can split a row without overflowing
        true: 'flex w-full flex-1 shrink basis-full',
        false: 'inline-flex',
      },
    },
    compoundVariants: [
      // region --- Icon only
      { iconOnly: true, size: 'small', className: 'h-24 w-24 p-2' },
      { iconOnly: true, size: 'medium', className: 'h-32 w-32 p-6' },
      { iconOnly: true, size: 'large', className: 'h-36 w-36 p-8' },
      { iconOnly: true, size: 'inline-edit', className: 'h-28 w-28 p-4' },
      // endregion

      // region --- Non-text end adjustment
      { hasNonTextEnd: true, size: 'small', className: 'pr-2' },
      { hasNonTextEnd: true, size: 'medium', className: 'pr-6' },
      { hasNonTextEnd: true, size: 'large', className: 'pr-10' },
      { hasNonTextEnd: true, size: 'inline-edit', className: 'pr-4' },
      // endregion
    ],
  },
);
