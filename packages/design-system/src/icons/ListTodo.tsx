import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ListTodo: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M13 5h8' />
    <path d='M13 12h8' />
    <path d='M13 19h8' />
    <path d='m3 17 2 2 4-4' />
    <rect x='3' y='4' width='6' height='6' rx='1' />
  </SvgIcon>
);

ListTodo.displayName = 'ListTodoIcon';
