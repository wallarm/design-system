import { cva } from 'class-variance-authority';

export const numericBadgeVariants = cva(
  'inline-flex items-center rounded-full font-mono font-medium transition-colors w-max',
  {
    variants: {
      type: {
        primary: 'bg-states-primary-active text-text-primary',
        'primary-alt': 'bg-states-primary-alt-active text-text-primary-alt',
        brand: 'bg-bg-fill-brand text-text-primary-alt',
        destructive: 'bg-bg-fill-danger text-text-primary-alt',
        outline: 'border-1 border-border-primary bg-component-outline-button-bg text-text-primary',
        info: 'bg-states-info-active text-text-info',
      },
      size: {
        default: 'px-5 py-2 text-xs',
        small: 'p-3 text-2xs',
      },
      clickable: {
        true: 'cursor-pointer overlay active:outline-none active:ring-3',
        false: '',
      },
    },
    compoundVariants: [
      {
        type: 'outline',
        size: 'default',
        className: 'px-4 py-1',
      },
      {
        type: 'outline',
        size: 'small',
        className: 'p-2',
      },
      {
        clickable: true,
        type: 'primary',
        className:
          'hover:overlay-states-primary-hover active:overlay-states-primary-hover active:ring-focus-primary',
      },
      {
        clickable: true,
        type: 'primary-alt',
        className:
          'hover:overlay-states-primary-alt-hover active:overlay-states-primary-alt-hover active:ring-focus-primary',
      },
      {
        clickable: true,
        type: 'brand',
        className:
          'hover:overlay-states-on-fill-hover active:overlay-states-on-fill-hover active:ring-focus-brand',
      },
      {
        clickable: true,
        type: 'destructive',
        className:
          'hover:overlay-states-on-fill-hover active:overlay-states-on-fill-hover active:ring-focus-destructive',
      },
      {
        clickable: true,
        type: 'outline',
        className:
          'hover:overlay-states-primary-hover active:overlay-states-primary-hover active:ring-focus-primary',
      },
      {
        clickable: true,
        type: 'info',
        className:
          'hover:overlay-states-info-hover active:overlay-states-info-hover active:ring-focus-primary',
      },
    ],
  },
);
