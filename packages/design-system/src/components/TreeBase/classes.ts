import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

export const treeRootVariants = cva('relative flex flex-col');

export const treeListVariants = cva('flex flex-col');

export const treeBranchVariants = cva('relative flex flex-col');

export const treeBranchControlVariants = cva(
  cn('group/trigger relative flex min-w-0 w-full items-start cursor-pointer'),
);

export const treeBranchContentVariants = cva(
  cn(
    'overflow-hidden',
    'data-[state=open]:animate-[ds-accordion-down_220ms_cubic-bezier(0.4,0,0.2,1)]',
    'data-[state=closed]:animate-[ds-accordion-up_220ms_cubic-bezier(0.4,0,0.2,1)]',
    'motion-reduce:animate-none',
  ),
);

export const treeBranchIndentGuideVariants = cva('absolute top-0 bottom-0 w-px');

export const treeItemVariants = cva('relative flex items-start');
