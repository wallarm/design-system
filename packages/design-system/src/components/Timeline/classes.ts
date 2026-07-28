import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

export const timelineVariants = cva('list-none flex flex-col');

export const timelineItemVariants = cva(
  cn(
    'grid grid-cols-[auto_1fr] gap-x-8',
    '[&:last-child_[data-slot=timeline-separator]]:hidden',
    '[&:last-child_[data-slot=timeline-content]]:pb-0',
  ),
);

export const timelineConnectorVariants = cva('col-start-1 flex flex-col items-center h-full');

export const timelineSeparatorVariants = cva('flex-1 min-h-16');

export const timelineContentVariants = cva('col-start-2 flex flex-col gap-4 min-w-0 pb-16');
