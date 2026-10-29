import type { FC } from 'react';

export const IpListSeparator: FC = () => (
  <span aria-hidden='true' className='shrink-0 text-text-tertiary select-none'>
    ·
  </span>
);

IpListSeparator.displayName = 'IpListSeparator';
