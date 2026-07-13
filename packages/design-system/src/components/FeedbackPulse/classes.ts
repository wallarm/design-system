import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

export const feedbackPulseVariants = cva(
  cn(
    // Fixed bottom-right — deliberately apart from the bottom-CENTER Toast; must not block CTAs.
    'fixed bottom-24 right-24 z-50 w-[400px] max-w-[calc(100vw-32px)]',
    // Surface — mirrors the Popover card recipe (ces-survey-architecture.md card spec).
    'relative flex flex-col gap-8 overflow-hidden p-12',
    'rounded-12 border border-border-primary-light bg-bg-surface-2 text-text-primary shadow-md',
    // Enter/exit — Toast/Drawer timing: 300ms open / 150ms close, slide up + fade.
    'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom data-[state=open]:duration-300',
    'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom data-[state=closed]:duration-150',
    'motion-reduce:animate-none motion-reduce:transition-none',
  ),
);
