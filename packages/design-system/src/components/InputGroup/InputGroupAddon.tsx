import type { ComponentProps, FC, MouseEvent } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const inputGroupAddonVariants = cva(
  cn([
    // Layout
    'flex items-center justify-center h-full gap-2 py-8',
    // Text
    'text-sm font-sans',
    // Misc
    'select-none group-data-[disabled=true]/input-group:opacity-50',
    // Icons
    "[&>svg]:text-icon-secondary [&>svg:not([class*='size-'])]:size-16",
    // Select
    'has-[>[data-scope=select]]:p-0',
    // SelectTrigger
    '[&>[data-scope=select]]:[&>[data-part=control]]:[&>[data-part=trigger]]:bg-transparent',
    '[&>[data-scope=select]]:[&>[data-part=control]]:[&>[data-part=trigger]]:border-none',
    '[&>[data-scope=select]]:[&>[data-part=control]]:[&>[data-part=trigger]]:rounded-none',
    '[&>[data-scope=select]]:[&>[data-part=control]]:[&>[data-part=trigger]]:shadow-none',
    '[&>[data-scope=select]]:[&>[data-part=control]]:[&>[data-part=trigger]]:ring-0',
  ]),
  {
    variants: {
      align: {
        'inline-start': 'order-first pl-12 has-[>kbd]:pl-8',
        'inline-end': 'order-last pr-12 has-[>kbd]:pr-8',
      },
      variant: {
        outline: 'px-12 bg-states-primary-default-alt border-border-primary',
        ghost: '[&:not(:has([data-scope=select]))+[data-slot=input]]:px-0',
      },
    },
    defaultVariants: {
      align: 'inline-start',
    },
    compoundVariants: [
      {
        variant: 'outline',
        align: 'inline-start',
        className: 'border-r-1',
      },
      {
        variant: 'outline',
        align: 'inline-end',
        className: 'border-l-1',
      },
      {
        variant: 'ghost',
        align: 'inline-start',
        className: 'pr-8',
      },
      {
        variant: 'ghost',
        align: 'inline-end',
        className: 'pl-8',
      },
    ],
  },
);

export const InputGroupAddon: FC<
  ComponentProps<'div'> & VariantProps<typeof inputGroupAddonVariants>
> = ({ align = 'inline-start', variant = 'ghost', ...props }) => {
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }

    event.currentTarget.parentElement?.querySelector('input')?.focus();
  };

  return (
    <div
      {...props}
      role='group'
      data-slot='input-group-addon'
      data-align={align}
      className={cn(inputGroupAddonVariants({ align, variant }))}
      onClick={handleClick}
    />
  );
};

InputGroupAddon.displayName = 'InputGroupAddon';
