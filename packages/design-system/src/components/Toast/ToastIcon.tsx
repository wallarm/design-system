import type { FC, PropsWithChildren } from 'react';
import { useTestId } from '../../utils/testId';

export const ToastIcon: FC<PropsWithChildren> = ({ children }) => {
  const testId = useTestId('icon');

  return (
    <div className='flex shrink-0 pt-2 pb-2' data-part='toast-icon' data-testid={testId}>
      {children}
    </div>
  );
};

ToastIcon.displayName = 'ToastIcon';
