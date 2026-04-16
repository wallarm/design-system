import type { FC, SVGProps } from 'react';

export const IndeterminateIcon: FC<SVGProps<SVGSVGElement>> = props => (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' aria-hidden focusable={false} {...props}>
    <rect x='3.5' y='10.5' width='17' height='3' rx='0.75' fill='currentColor' />
  </svg>
);
