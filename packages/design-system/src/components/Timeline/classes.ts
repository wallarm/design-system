import { cva } from 'class-variance-authority';

import { cn } from '../../utils/cn';

export const timelineVariants = cva('flex list-none flex-col');

export const timelineItemVariants = cva(
  cn(
    'grid grid-cols-[auto_1fr] gap-x-8',
    '[&:last-child_[data-slot=timeline-separator]]:hidden',
    '[&:last-child_[data-slot=timeline-content]]:pb-0',
  ),
);

export const timelineConnectorVariants = cva('col-start-1 flex h-full flex-col items-center');

export const timelineSeparatorVariants = cva('min-h-16 flex-1 self-center');

export const timelineContentVariants = cva('col-start-2 flex min-w-0 flex-col gap-4 pb-16');
