import type { FC } from 'react';

export const IpListSeparator: FC = () => (
  <span aria-hidden='true' className='text-text-tertiary select-none shrink-0'>
    ·
  </span>
);

IpListSeparator.displayName = 'IpListSeparator';
