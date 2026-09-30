import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

/**
 * Root: vertical stack — picker, error, then the item list, 8px apart (Figma:
 * "8px before the first file and between files"; the 4px under the label is Field's gap).
 */
export const fileUploadVariants = cva('flex w-full min-w-0 flex-col gap-8');

/**
 * Dashed drop Area (Figma `file-upload-area`): fixed 96px tall, fills its container,
 * min 300px. Hover and drag-over share one brand look. `data-disabled` is set by the DS
 * for disabled / locked (uploading) / max-files-reached; `data-invalid` for Field errors
 * and rejections.
 */
export const fileUploadDropzoneVariants = cva(
  cn(
    'flex h-96 w-full min-w-300 cursor-pointer flex-col items-center justify-center gap-8 px-16 text-center',
    'rounded-12 border-1 border-dashed border-border-primary bg-states-primary-default-alt',
    'text-sm text-text-primary transition-colors outline-none',
    'focus-visible:ring-3 focus-visible:ring-focus-primary',
    'not-data-disabled:hover:border-border-brand not-data-disabled:hover:bg-states-brand-hover not-data-disabled:hover:text-text-brand',
    'data-dragging:border-border-brand data-dragging:bg-states-brand-hover data-dragging:text-text-brand',
    'data-invalid:border-border-strong-danger',
    'data-disabled:cursor-not-allowed data-disabled:text-text-disable-primary',
  ),
);

/**
 * One file row (Figma `file-upload-item`): 36px, or 52px with a description line.
 * Padding mirrors Figma's absolute offsets (details at 10/8, actions at right 6 / top 6).
 */
export const fileUploadItemVariants = cva(
  'group/item flex w-full min-w-0 items-start gap-8 rounded-12 bg-bg-primary py-8 pr-6 pl-10',
);

export const fileUploadItemIconClassNames = cn(
  'mt-2 flex shrink-0 text-icon-secondary group-data-loading/item:text-icon-primary-disable',
);

export const fileUploadItemNameClassNames = cn(
  'block truncate text-sm text-text-primary group-data-loading/item:text-text-disable-primary',
);

export const fileUploadItemDescriptionClassNames = cn('block truncate text-xs text-text-secondary');

/** Actions sit on the 24px button line: -2px pulls them to Figma's top-6 inside the py-8 row. */
export const fileUploadItemActionsClassNames = cn('-my-2 flex shrink-0 items-center gap-4');

export const fileUploadErrorClassNames = cn('flex flex-col gap-4 text-text-danger');
