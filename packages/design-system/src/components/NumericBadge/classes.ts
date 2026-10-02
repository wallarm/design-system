import { cva } from 'class-variance-authority';

export const numericBadgeVariants = cva(
  'inline-flex w-max shrink-0 items-center justify-center whitespace-nowrap rounded-full font-mono font-medium transition-colors',
  {
    variants: {
      type: {
        solid: '',
        secondary: '',
        outline: 'border-1',
      },
      color: {
        neutral: '',
        'neutral-alt': '',
        brand: '',
        danger: '',
        success: '',
        info: '',
      },
      size: {
        default: 'h-20 min-w-16 px-5 py-2 text-xs [&_svg]:icon-md',
        small: 'h-16 min-w-12 px-3 py-2 text-2xs [&_svg]:icon-sm',
      },
      iconOnly: {
        true: '',
      },
      clickable: {
        true: 'cursor-pointer overlay active:outline-none active:ring-3 focus-visible:outline-none focus-visible:ring-3',
        false: '',
      },
    },
    compoundVariants: [
      {
        type: 'solid',
        color: 'brand',
        className: 'bg-bg-fill-brand text-text-primary-alt',
      },
      {
        type: 'solid',
        color: 'danger',
        className: 'bg-bg-fill-danger text-text-primary-alt',
      },
      {
        type: 'secondary',
        color: 'neutral',
        className: 'bg-states-primary-active text-text-primary',
      },
      {
        type: 'secondary',
        color: 'neutral-alt',
        className: 'bg-states-primary-alt-active text-text-primary-alt',
      },
      {
        type: 'secondary',
        color: 'brand',
        className: 'bg-states-brand-active text-text-brand',
      },
      {
        type: 'secondary',
        color: 'danger',
        className: 'bg-states-danger-active text-text-danger',
      },
      {
        type: 'secondary',
        color: 'success',
        className: 'bg-states-success-active text-text-success',
      },
      {
        type: 'secondary',
        color: 'info',
        className: 'bg-states-info-active text-text-info',
      },
      {
        type: 'outline',
        color: 'neutral',
        className: 'border-border-primary bg-component-outline-button-bg text-text-primary',
      },
      {
        type: 'outline',
        color: 'brand',
        className: 'border-border-brand bg-bg-brand text-text-brand',
      },
      {
        type: 'outline',
        color: 'danger',
        className: 'border-border-danger bg-bg-danger text-text-danger',
      },
      {
        type: 'outline',
        color: 'success',
        className: 'border-border-success bg-bg-success text-text-success',
      },
      {
        type: 'outline',
        size: 'default',
        className: 'px-4 py-1',
      },
      {
        type: 'outline',
        size: 'small',
        className: 'px-2 py-1',
      },
      {
        iconOnly: true,
        className: 'px-2 py-2',
      },
      {
        type: 'outline',
        iconOnly: true,
        className: 'px-1 py-1',
      },
      {
        clickable: true,
        type: ['secondary', 'outline'],
        color: 'neutral',
        className: 'hover:overlay-states-primary-hover active:overlay-states-primary-hover',
      },
      {
        clickable: true,
        type: 'secondary',
        color: 'neutral-alt',
        className: 'hover:overlay-states-primary-alt-hover active:overlay-states-primary-alt-hover',
      },
      {
        clickable: true,
        type: 'solid',
        color: 'brand',
        className:
          'hover:overlay-states-on-fill-hover active:overlay-states-on-fill-hover active:ring-focus-brand focus-visible:ring-focus-brand',
      },
      {
        clickable: true,
        type: 'solid',
        color: 'danger',
        className:
          'hover:overlay-states-on-fill-hover active:overlay-states-on-fill-hover active:ring-focus-destructive focus-visible:ring-focus-destructive',
      },
      {
        clickable: true,
        type: ['secondary', 'outline'],
        color: 'brand',
        className: 'hover:overlay-states-brand-hover active:overlay-states-brand-hover',
      },
      {
        clickable: true,
        type: ['secondary', 'outline'],
        color: 'danger',
        className: 'hover:overlay-states-danger-hover active:overlay-states-danger-hover',
      },
      {
        clickable: true,
        type: ['secondary', 'outline'],
        color: 'success',
        className: 'hover:overlay-states-success-hover active:overlay-states-success-hover',
      },
      {
        clickable: true,
        type: 'secondary',
        color: 'info',
        className: 'hover:overlay-states-info-hover active:overlay-states-info-hover',
      },
      {
        clickable: true,
        type: ['secondary', 'outline'],
        className: 'active:ring-focus-primary focus-visible:ring-focus-primary',
      },
    ],
  },
);
