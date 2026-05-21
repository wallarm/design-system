import type { FC } from 'react';

export const HomeContent: FC = () => (
  <div className='p-24'>
    <h1 className='text-xl font-semibold text-text-primary'>Home</h1>
    <p className='mt-4 text-sm text-text-secondary'>
      Cross-product summary. Click any product in the rail to drill into it.
    </p>
  </div>
);
